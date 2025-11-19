import tkinter as tk
from tkinter import *
from tkinter import messagebox, filedialog
import customtkinter
from PIL import Image, ImageTk
from functools import partial
import mysql.connector as my
import datetime
import time
import webbrowser
import ctypes as ct
import manage_data as manage_data  # Uses your new automated engine
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D
import matplotlib
import numpy as np
import pandas as pd
import os
import sys
import pickle

# --- THEME & CONFIGURATION ---
APP_THEME = "appconfig"

dark_colors = {
    "mode" : "dark", "Primary": "#171717", "Neutral" : "#1a1a1a",
    "Black" : "#000000", "White" : "#ffffff", "Intro" : "e8e8e8", "Text" : "#e8e8e8",
}
light_colors = {
    "mode" : "light", "Primary": "#f4f4f4", "Neutral" : "#e8e8e8",
    "Black" : "#ffffff", "White" : "#000000", "Intro" : "#000000", "Text" : "#161616"
}
colors=["#440154", "#3b528b","#21918c", "#5ec962", "#fde725","#f89540", "#e16462","#b12a90", "#6a00a8", "#0d0887", "#3474eb", "#5ec962", "yellow", "#f89540", "tomato","tan"]

# --- GLOBAL VARIABLES ---
relation = None
form = None
menu = None
text = None
title = None
names_form = None
values_form = None
values_1_form = None
AVIS_DATAFRAME = None
X_COL_NAME = None
Y_COL_NAME = None

def load_theme():
    try:
        with open(APP_THEME, "rb") as file: return pickle.load(file)
    except: return "dark"

mode = load_theme()
theme = dark_colors if mode == "dark" else light_colors

def icon_provider(mode):
    path = "software/images/{mode}/"
    icons = {"3dlogo": "", "2dlogo" : "", "line_graph" : "", "bar_graph" : "", "histogram" : "", "area_chart" : "", "scatter_plot" : "", "heatmap_plot" : "", "radar_chart" : "", "pie_chart" : "", "3dScatter" : "", "equation" : "", "polarScatter" : "", "surface" : "", "home" : "", "preview" : "", "user" : "", "visualization" : "", "delete-user" : "", "globe" : "", "background" : "", "add" : "", "view" : "", "pie_chart" : "", "logout" : "", "delete" : "", "finance" : "", "mode" : ""}
    ret_icons = {}
    for k in icons.keys(): ret_icons[k] = path.format(mode=mode) + k + ".png"
    return ret_icons

icons = icon_provider(mode)

def save_theme(theme_name):
    with open(APP_THEME, "wb") as file: pickle.dump(theme_name, file)

def switch_theme():
    global theme
    if mode == "dark": save_theme("light")
    else: save_theme("dark")
    messagebox.showinfo("Restart", "Please restart the application to apply the new theme.")

# --- DATABASE CONNECTION (Legacy/Auth) ---
mycon = manage_data.mycon
cursor = manage_data.cursor

# --- UTILS ---
def encrypt(pwd):
    e = ""
    for char in pwd: e += chr(ord(char) * 2) # Simple shift for demo
    return e

def resize_image(image_path, width=20, height=20):
    image = Image.open(image_path)
    image = image.resize((width, height), Image.Resampling.LANCZOS)
    return ImageTk.PhotoImage(image)

def clear_widgets():
    """Helper to hide all active frames."""
    global relation, form, menu, text, title, names_form, values_form, values_1_form
    if relation: relation.pack_forget()
    if form: form.pack_forget()
    if menu: menu.pack_forget()
    if text: text.pack_forget()
    if title: title.pack_forget()
    if names_form: names_form.place_forget()
    if values_form: values_form.place_forget()
    if values_1_form: values_1_form.place_forget()

def switch(b1,b2,b3,b4):
    b1["state"] = DISABLED
    b2["state"] = NORMAL
    b3["state"] = NORMAL
    b4["state"] = NORMAL

def callback(url):
    webbrowser.open_new(url)

# ----------------------------------------------------------------------------------
# NEW AUTOMATION LOGIC (PHASE 3 COMPLETE)
# ----------------------------------------------------------------------------------

def automated_plot(c, df, x_col, y_col):
    """
    Functionality 4: Generates the plot automatically from the loaded DataFrame.
    """
    try:
        x_data = df[x_col].tolist()
        y_data = df[y_col].tolist()

        if theme["mode"] == "dark": plt.style.use('dark_background')
        else: plt.style.use('default')

        fig, ax = plt.subplots(figsize=(6.5, 5))
        
        if c == "line":
            plt.plot(x_data, y_data, label=y_col.title(), color=colors[0], linewidth=2)
            plot_type = "Line Graph (Time Series)"
        elif c == "bar":
            plt.bar(x_data, y_data, label=y_col.title(), color=colors[2], alpha=0.7)
            plot_type = "Bar Chart (Distribution)"
        elif c == "scatter":
            plt.scatter(x_data, y_data, label=y_col.title(), color=colors[1], s=50)
            plot_type = "Scatter Plot (Correlation)"
        elif c == "hist":
            plt.hist(y_data, color=colors[3], alpha=0.7)
            plot_type = "Histogram (Frequency)"
        else:
            plot_type = "Visualization"

        plt.legend(bbox_to_anchor=(1.02, 1), loc='upper left', borderaxespad=0)
        plt.title(f"A.V.I.S. Automated Plot: {y_col.title()} ({plot_type})")
        plt.xticks(rotation=30)
        plt.xlabel(x_col.title())
        plt.ylabel(y_col.title())
        ax.grid(linestyle="dashed", linewidth=1, alpha=0.25)
        
        # Functionality 5: Automated Insight
        messagebox.showinfo(
            title="A.V.I.S. Insight", 
            message=f"Automated Analysis Complete!\n\nType: {plot_type}\nAxes: {x_col} vs {y_col}\n\nInsight: Data loaded and visualized automatically without manual entry.",
            icon="info"
        )
        plt.show()

    except Exception as e:
        messagebox.showerror("Plot Error", f"Failed to plot: {e}")

def auto_analyze_file(b1, b2, b3, b4):
    """
    Functionality 1 & 3: File Selection, Loading, and Automated EDA Execution.
    """
    global AVIS_DATAFRAME, X_COL_NAME, Y_COL_NAME, text
    
    file_path = filedialog.askopenfilename(
        defaultextension=".csv",
        filetypes=[("Data Files", "*.csv *.xlsx"), ("All files", "*.*")]
    )
    
    if not file_path: return
        
    # Call the engine
    df, message, x_col, y_col = manage_data.load_and_process_data(file_path)
    
    if df is None:
        messagebox.showerror("Processing Error", message)
        return
        
    AVIS_DATAFRAME = df
    X_COL_NAME = x_col
    Y_COL_NAME = y_col
    
    # Display Automated EDA Report
    if text: text.pack_forget()
    text = Label(font="consolas 9", fg=theme["White"], bg=theme["Black"], 
                 text=f"A.V.I.S. Automated EDA Report:\n{message}", justify=LEFT)
    text.pack(fill=X, pady=10, padx=20)

    # Enable Buttons for Plotting
    b1.config(command=partial(automated_plot, "line", df, X_COL_NAME, Y_COL_NAME), text=f"Auto-Plot: Line", state=NORMAL)
    b2.config(command=partial(automated_plot, "bar", df, X_COL_NAME, Y_COL_NAME), text=f"Auto-Plot: Bar", state=NORMAL)
    b3.config(command=partial(automated_plot, "scatter", df, X_COL_NAME, Y_COL_NAME), text=f"Auto-Plot: Scatter", state=NORMAL)
    b4.config(command=partial(automated_plot, "hist", df, X_COL_NAME, Y_COL_NAME), text=f"Auto-Plot: Hist", state=NORMAL)
    
    messagebox.showinfo("Success", "Automated EDA Complete. Select a chart type to visualize.", icon="info")

# ----------------------------------------------------------------------------------
# CORE MENUS (Guest, Login, Create, Delete)
# ----------------------------------------------------------------------------------

def guest(b1,b2,b3,b4,preview_image):
    """
    The New A.V.I.S. Automated Dashboard (Replaces the old manual menu)
    """
    switch(b1,b2,b3,b4)
    clear_widgets()
    preview_image.place_forget()
    
    global menu, title
    menu = Frame(root, bg=theme["Primary"], relief=SUNKEN)
    menu.pack(side=LEFT, fill=Y)
    
    title = Label(font="poppins 10 bold", fg=theme["White"], bg=theme["Black"], text="A.V.I.S. AUTOMATED ANALYSIS")
    title.pack(fill=X, pady=35, padx=(0, 200))

    # 1. Load Button
    load_img = resize_image(icons["add"], 20)
    load_btn = Button(menu, fg=theme["White"], bg=theme["Neutral"], text="1. Load File (CSV/Excel)", 
                      compound='left', width=25, anchor='w', font="poppins 10", 
                      cursor="hand2", padx=10, image=load_img,
                      command=partial(auto_analyze_file, b1, b2, b3, b4))
    load_btn.image = load_img
    load_btn.pack(pady=(30, 5), padx=15)
    
    # 2. Plot Buttons (Placeholders updated by auto_analyze_file)
    line_img = resize_image(icons["line_graph"], 20)
    b_line = Button(menu, fg=theme["White"], bg=theme["Neutral"], text="Auto-Plot: Line", image=line_img, compound='left', width=25, anchor='w', font="poppins 10", cursor="hand2", padx=10, state=DISABLED)
    b_line.image = line_img
    b_line.pack(pady=5, padx=15)
    
    bar_img = resize_image(icons["bar_graph"], 20)
    b_bar = Button(menu, fg=theme["White"], bg=theme["Neutral"], text="Auto-Plot: Bar", image=bar_img, compound='left', width=25, anchor='w', font="poppins 10", cursor="hand2", padx=10, state=DISABLED)
    b_bar.image = bar_img
    b_bar.pack(pady=5, padx=15)
    
    scat_img = resize_image(icons["scatter_plot"], 20)
    b_scat = Button(menu, fg=theme["White"], bg=theme["Neutral"], text="Auto-Plot: Scatter", image=scat_img, compound='left', width=25, anchor='w', font="poppins 10", cursor="hand2", padx=10, state=DISABLED)
    b_scat.image = scat_img
    b_scat.pack(pady=5, padx=15)
    
    hist_img = resize_image(icons["histogram"], 20)
    b_hist = Button(menu, fg=theme["White"], bg=theme["Neutral"], text="Auto-Plot: Hist", image=hist_img, compound='left', width=25, anchor='w', font="poppins 10", cursor="hand2", padx=10, state=DISABLED)
    b_hist.image = hist_img
    b_hist.pack(pady=5, padx=15)
    
    # Pass buttons to auto_analyze so it can enable them
    load_btn.configure(command=partial(auto_analyze_file, b_line, b_bar, b_scat, b_hist))

    home_img = resize_image(icons["home"], 20)
    b_home = Button(menu, fg=theme["White"], bg=theme["Neutral"], image=home_img, text="Go To Home", compound='left', width=25, anchor='w', font="poppins 10", cursor="hand2", padx=10, command=main)
    b_home.image = home_img
    b_home.pack(pady=30, padx=15)

def create(b2,b1,b3,b4,preview_image):
    global relation, text, form, title
    
    def show_message(u_name_var, pwd_var, country_var, names): 
        try:
            u_name = u_name_var.get()
            pwd_text = pwd_var.get()
            country = country_var.get()
            pwd = encrypt(pwd_text) 
            
            if u_name in names:
                messagebox.showinfo(title="Unavailable", message="Username already taken.",icon="info")
            else:
                u_id_str = datetime.datetime.now().strftime("%y%m%d%H%M%S")
                u_id = int(u_id_str)
                q="insert into user values({},'{}','{}','{}')".format(u_id,u_name,pwd,country)
                cursor.execute(q)
                mycon.commit()
                msg="Account Created Successfully! ✓\nYour User ID is: {}\n".format(u_id)
                global text
                if text: text.pack_forget()
                text=Label(font="poppins 10 bold",fg=theme["White"],bg=theme["Black"],text=msg)
                text.pack(fill=X,pady=35,padx=(0,200))
                messagebox.showinfo(title="Success", message=f"Account Created. User ID: {u_id}",icon="info")
        except Exception as e:
            messagebox.showerror(title="Error", message=f"Creation failed: {e}", icon="error")

    switch(b2,b1,b3,b4)
    preview_image.place_forget()
    names=[]
    try:
        q="select u_name from user"
        cursor.execute(q)
        data=cursor.fetchall()
        for i in data: names.append(i[0])
    except: pass
    
    clear_widgets()
    form=Frame(root,bg=theme["Primary"],relief=SUNKEN)
    form.pack(side=TOP,fill=Y,pady=140,padx=(0,200))
    title=Label(form,font="poppins 10",fg=theme["White"],bg=theme["Primary"],text="Create A.V.I.S. Account")
    title.pack(fill=Y,pady=35,padx=0)
    
    u_name=StringVar()
    pwd=StringVar()
    country=StringVar()
    Entry(form,textvariable=u_name,width=30).pack(pady=20,padx=50)
    Entry(form,textvariable=pwd,width=30).pack(pady=20,padx=50)
    Entry(form,textvariable=country,width=30).pack(pady=20,padx=50)
    
    Button(form,text="Create Account",width=15,command=partial(show_message,u_name,pwd,country,names),cursor="hand2").pack(pady=20)

def login(b1,b2,b3,b4,preview_image):
    switch(b1,b2,b3,b4)
    preview_image.place_forget()
    def show_message():
        message=manage_data.check_credentials(f"{user.get()}",f"{pwd.get()}")
        if "Successful" in message:
            messagebox.showinfo(title="Success", message=message,icon="info")
            clear_widgets()
            user_menu(message.split(' ')[-1],f"{user.get()}")
        else:
            messagebox.showinfo(title="Failed", message=message,icon="error")
            
    clear_widgets()
    global form, title
    form=Frame(root,bg=theme["Primary"],relief=SUNKEN)
    form.pack(side=TOP,fill=Y,pady=140,padx=(0,200))
    title=Label(form,font="poppins 10",fg=theme["White"],bg=theme["Primary"],text="INTELLIGENT ANALYTICS LOGIN")
    title.pack(fill=Y,pady=35,padx=0)
    user=StringVar()
    pwd=StringVar()
    Entry(form,textvariable=user,width=30).pack(pady=20,padx=50)
    Entry(form,textvariable=pwd,width=30,show="●").pack(pady=20,padx=50)
    Button(form,text="Login",width=15,command=show_message,cursor="hand2").pack(pady=20)

def delete(b4,b1,b3,b2,preview_image):
    def show_message(u_name,u_id,pwd,names):
        # Logic simplified for brevity
        messagebox.showinfo("Info", "Delete functionality placeholder.")

    switch(b4,b1,b3,b2)
    preview_image.place_forget()
    clear_widgets()
    global form, title
    form=Frame(root,bg=theme["Primary"],relief=SUNKEN)
    form.pack(side=TOP,fill=Y,pady=140,padx=(0,200))
    title=Label(form,font="poppins 10",fg=theme["White"],bg=theme["Primary"],text="Delete A.V.I.S Account")
    title.pack(fill=Y,pady=35,padx=0)
    Button(form,text="Delete Account",width=15,command=lambda: messagebox.showinfo("Info","Feature disabled in 40% demo"),cursor="hand2").pack(pady=20)

def user_menu(u_id,u_name):
    clear_widgets()
    global menu
    menu=Frame(root,bg=theme["Primary"],relief=SUNKEN)
    menu.pack(side=LEFT,fill=Y)
    
    # Re-use guest/automation logic for logged in users too
    load_btn = Button(menu, fg=theme["White"], bg=theme["Neutral"], text="Launch Automated Analysis", 
                  width=25, font="poppins 10", cursor="hand2", padx=10, 
                  command=partial(guest, None, None, None, None, Label())) # Hacky redirect to main tool
    load_btn.pack(pady=50)

    logout_btn = Button(menu, fg=theme["White"], bg=theme["Neutral"], text="Logout", 
                  width=25, font="poppins 10", cursor="hand2", padx=10, command=main)
    logout_btn.pack(pady=20)

def dark(window):
    window.update()
    try:
        # Windows dark mode title bar hack
        set_window_attribute = ct.windll.dwmapi.DwmSetWindowAttribute
        get_parent = ct.windll.user32.GetParent
        hwnd = get_parent(window.winfo_id())
        value = 2
        value = ct.c_int(value)
        set_window_attribute(hwnd, 20, ct.byref(value), 4)
    except: pass

# --- MAIN ENTRY POINT ---
def main():
    clear_widgets()
    global menu, text
    menu=Frame(root,bg=theme["Primary"],relief=SUNKEN)
    menu.pack(side=LEFT,fill=Y)
    
    text = tk.Text(root, wrap="word",fg=theme["Text"],bg=theme["Black"],padx=15,pady=15,font="consolas 12",relief="flat")
    text.insert("end", '''Welcome to A.V.I.S. - Analytical Visual Intelligent System!\n\nUnified Data Intelligence Platform (Prototype v0.4)\n\nCapabilities (40% Milestone):\n\n1. Automated Data Ingestion: Loads CSV/Excel files.\n2. Automated EDA: Instantly profiles data & detects types.\n3. Automated Visualization: Generates appropriate charts without manual input.\n\nSelect "Automated Analysis" to begin.\n\n\n<--- Start Here''')
    text.pack(pady=20,padx=40,side=TOP,anchor=W,fill=BOTH)

    # Main Buttons
    viz_img = resize_image(icons["visualization"], 20)
    b1=Button(menu,fg=theme["White"],bg=theme["Neutral"],image=viz_img,text="Automated Analysis",compound='left',width=170,anchor='w',font="poppins 10",cursor="hand2",padx=10)
    b1.image = viz_img
    b1.pack(pady=(30,5),padx=15)
    
    user_img = resize_image(icons["user"], 20)
    b3=Button(menu,fg=theme["White"],bg=theme["Neutral"],image=user_img,text="Create Account",compound='left',width=170,anchor='w',font="poppins 10",cursor="hand2",padx=10)
    b3.image = user_img
    b3.pack(pady=5,padx=15)
    
    fin_img = resize_image(icons["finance"], 20)
    b2=Button(menu,fg=theme["White"],bg=theme["Neutral"],image=fin_img,text="Login (User)",compound='left',width=170,anchor='w',font="poppins 10",cursor="hand2",padx=10)
    b2.image = fin_img
    b2.pack(pady=5,padx=15)
    
    del_img = resize_image(icons["delete-user"], 20)
    b4=Button(menu,fg=theme["White"],bg=theme["Neutral"],image=del_img,text="Delete Account",compound='left',width=170,anchor='w',font="poppins 10",cursor="hand2",padx=10)
    b4.image = del_img
    b4.pack(pady=5,padx=15)

    # Fake preview image for layout
    preview_image=Label(bg=theme["Black"], borderwidth=0) 
    preview_image.place(relx=1.0, rely=1.0, x=-40, y=-40,anchor="se")

    b1.config(command=partial(guest,b1,b2,b3,b4,preview_image))
    b2.config(command=partial(login,b2,b1,b3,b4,preview_image))
    b3.config(command=partial(create,b3,b1,b2,b4,preview_image))
    b4.config(command=partial(delete,b4,b1,b2,b3,preview_image))
    
    root.mainloop()

# --- INITIALIZATION ---
root=Tk()
root.geometry("1100x700")
root.title("A.V.I.S. - Analytical Visual Intelligent System")
root.minsize(600,300)

bg=Image.open(icons["background"])
img=bg.resize((1400,860))
my_img=ImageTk.PhotoImage(img)
label1 = Label( root, image = my_img, borderwidth=0, highlightthickness=0)
label1.place(x = 200, y = 0)

dark(root)
photo = PhotoImage(file = icons["2dlogo"])
root.iconphoto(False, photo)
root.configure(bg=theme["Black"])

top=Frame(root,bg=theme["Neutral"],width=100)
top.grid_columnconfigure(1, weight=1)
title=Label(top,font="Courier 15 bold",fg=theme["White"],bg=theme["Neutral"],text="A.V.I.S.")
title.grid(row = 0, column = 1,padx=0,pady=(20,10), sticky="w")
top.pack(side=TOP,fill=X)

logo_img = Image.open(icons["3dlogo"]).resize((50, 50))
logo = ImageTk.PhotoImage(logo_img)
Label(top,bg=theme["Neutral"],image = logo).grid(row = 0, column = 0,padx=(15,20),pady=(20,10))

# Start App
if __name__ == "__main__":
    main()
    try:
        if mycon and mycon.is_connected(): mycon.close()
    except: pass