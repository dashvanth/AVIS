
import io
import zipfile
import json
import pandas as pd
from fastapi import HTTPException
from fastapi.responses import StreamingResponse
from sqlmodel import Session
from app.models.dataset import Dataset
from app.services import export_service
from app.services.dataset_service import _save_dataframe

import os

# MIME types for each format
FORMAT_MIME = {
    "csv": "text/csv",
    "tsv": "text/tab-separated-values",
    "xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "xls": "application/vnd.ms-excel",
    "json": "application/json",
    "xml": "application/xml",
    "parquet": "application/octet-stream",
}

def generate_csv_export(dataset_id: int, version: str, session: Session):
    """
    Generates a file download in the ORIGINAL format of the dataset.
    version: "original" or "prepared"
    """
    dataset = session.get(Dataset, dataset_id)
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")

    target_filepath = dataset.filepath
    file_type = dataset.file_type if dataset.file_type else "csv"

    if not target_filepath or not os.path.exists(target_filepath):
         raise HTTPException(status_code=404, detail="File is missing. Please re-upload.")

    try:
        # Read the stored file using the format-aware loader from eda_service
        from app.services.eda_service import _load_dataframe_from_disk
        df = _load_dataframe_from_disk(target_filepath)

        # Write back in the original format
        if file_type in ("csv", "tsv"):
            sep = '\t' if file_type == 'tsv' else ','
            stream = io.StringIO()
            df.to_csv(stream, index=False, sep=sep)
            content = stream.getvalue().encode('utf-8')
        elif file_type in ("xlsx", "xls"):
            stream = io.BytesIO()
            df.to_excel(stream, index=False, engine='openpyxl')
            content = stream.getvalue()
        elif file_type == "json":
            content = df.to_json(orient='records', indent=2).encode('utf-8')
        elif file_type == "xml":
            content = df.to_xml(index=False).encode('utf-8')
        elif file_type == "parquet":
            stream = io.BytesIO()
            df.to_parquet(stream, index=False)
            content = stream.getvalue()
        else:
            # Fallback to CSV
            stream = io.StringIO()
            df.to_csv(stream, index=False)
            content = stream.getvalue().encode('utf-8')

        mime = FORMAT_MIME.get(file_type, "application/octet-stream")
        response = StreamingResponse(iter([content]), media_type=mime)
        response.headers["Content-Disposition"] = f"attachment; filename={dataset.filename}"
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Download failed: {str(e)}")

def generate_full_zip(dataset_id: int, session: Session):
    """
    Bundles all artifacts into a single ZIP file.
    - Data (in original format)
    - Summary (MD)
    - Issues (JSON)
    """
    dataset = session.get(Dataset, dataset_id)
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
        
    report = export_service.generate_research_report(dataset_id, session)
    file_type = dataset.file_type if dataset.file_type else "csv"
    
    zip_buffer = io.BytesIO()
    with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zip_file:
        
        # 1. Add Data in original format
        try:
            from app.services.eda_service import _load_dataframe_from_disk
            df = _load_dataframe_from_disk(dataset.filepath)
            
            if file_type in ("csv", "tsv"):
                sep = '\t' if file_type == 'tsv' else ','
                data_content = df.to_csv(index=False, sep=sep)
                zip_file.writestr(f"{dataset.filename}", data_content)
            elif file_type in ("xlsx", "xls"):
                excel_buf = io.BytesIO()
                df.to_excel(excel_buf, index=False, engine='openpyxl')
                zip_file.writestr(f"{dataset.filename}", excel_buf.getvalue())
            elif file_type == "json":
                zip_file.writestr(f"{dataset.filename}", df.to_json(orient='records', indent=2))
            elif file_type == "xml":
                zip_file.writestr(f"{dataset.filename}", df.to_xml(index=False))
            else:
                zip_file.writestr(f"{dataset.filename}_data.csv", df.to_csv(index=False))
        except Exception:
            pass
            
        # 2. Add Report (Markdown)
        zip_file.writestr("research_report.md", report["markdown_content"])
        
        # 3. Add Issues (JSON)
        issues = {
            "identity": report["identity"],
            "readiness": report["readiness"],
            "recommendations": report["recommendations"]
        }
        zip_file.writestr("key_insights.json", json.dumps(issues, indent=2))
        
        # 4. Add Readme
        zip_file.writestr("README.txt", "Generated by A.V.I.S.\nThis export contains your dataset and automated analysis results.")

    zip_buffer.seek(0)
    
    response = StreamingResponse(iter([zip_buffer.getvalue()]), media_type="application/zip")
    response.headers["Content-Disposition"] = f"attachment; filename={dataset.filename.rsplit('.', 1)[0]}_bundle.zip"
    return response

def generate_summary_text(dataset_id: int, session: Session):
    report = export_service.generate_research_report(dataset_id, session)
    return report["markdown_content"]
