import React from "react";

const Loading: React.FC = () => {
    return (
        
            <div className="animate-spin size-6 border-[3px] border-current border-t-transparent text-white text-center rounded-full dark:text-white" role="status" aria-label="loading">
                <span className="sr-only">Loading...</span>
            </div>

    );
};

export default Loading;
