import React, { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

export interface ChatContextType {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    triggerMessage: (message: string, context?: any) => void;
    currentContext: any;
    setCurrentContext: (context: any) => void;
    pendingMessage: string | null;
    clearPendingMessage: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentContext, setCurrentContext] = useState<any>(null);
    const [pendingMessage, setPendingMessage] = useState<string | null>(null);

    const triggerMessage = (message: string, context?: any) => {
        if (context) setCurrentContext(context);
        setPendingMessage(message);
        setIsOpen(true);
    };

    const clearPendingMessage = () => setPendingMessage(null);

    return (
        <ChatContext.Provider value={{ 
            isOpen, 
            setIsOpen, 
            triggerMessage, 
            currentContext, 
            setCurrentContext, 
            pendingMessage, 
            clearPendingMessage 
        }}>
            {children}
        </ChatContext.Provider>
    );
};

export const useChat = () => {
    const context = useContext(ChatContext);
    if (!context) throw new Error("useChat must be used within a ChatProvider");
    return context;
};
