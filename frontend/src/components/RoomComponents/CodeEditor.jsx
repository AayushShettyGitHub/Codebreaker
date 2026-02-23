import React, { useState, useRef } from "react";
import { Maximize2, Minimize2 } from "lucide-react";
import Editor from "@monaco-editor/react";

const CodeEditor = ({ value, onChange, language = "python", disabled = false }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const editorRef = useRef(null);
  const containerRef = useRef(null);

  const getMonacoLanguage = () => {
    const languageMap = {
      python: "python",
      javascript: "javascript",
      java: "java",
      cpp: "cpp",
      c: "c",
      csharp: "csharp",
      typescript: "typescript",
      go: "go",
      rust: "rust",
    };
    return languageMap[language] || "python";
  };

  const handleFullscreen = () => {
    const elem = containerRef.current;
    if (!isFullscreen) {
      if (elem.requestFullscreen) elem.requestFullscreen();
      else if (elem.webkitRequestFullscreen) elem.webkitRequestFullscreen();
      else if (elem.msRequestFullscreen) elem.msRequestFullscreen();
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) document.exitFullscreen();
      else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
      else if (document.msExitFullscreen) document.msExitFullscreen();
      setIsFullscreen(false);
    }
  };

  React.useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && isFullscreen) setIsFullscreen(false);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, [isFullscreen]);

  const editorOptions = {
    minimap: { enabled: true },
    fontSize: 14,
    fontFamily: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace",
    formatOnPaste: true,
    formatOnType: true,
    tabSize: 4,
    insertSpaces: true,
    wordWrap: "on",
    scrollBeyondLastLine: false,
    renderWhitespace: "selection",
    lineNumbersMinChars: 3,
    smoothScrolling: true,
    cursorBlinking: "blink",
    autoClosingBrackets: "always",
    autoClosingQuotes: "always",
    bracketPairColorization: { enabled: true },
    "bracketPairColorization.independentColorPoolPerBracketType": true,
    suggestOnTriggerCharacters: true,
    quickSuggestions: {
      other: true,
      comments: false,
      strings: false,
    },
    readOnly: disabled,
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full transition-all duration-300 overflow-hidden ${isFullscreen ? "fixed inset-0 z-50 m-0" : "h-full min-h-[500px]"}`}
      style={{ backgroundColor: "#0a0a0f" }}
    >
      {}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between bg-[#141118] px-5 py-2.5 border-b border-[#1e1215]">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/60"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/40"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/40"></div>
          </div>
          <span className="text-xs text-[#6b6560] font-medium ml-1">
            {getMonacoLanguage().toUpperCase()}
          </span>
          {disabled && (
            <span className="px-2 py-0.5 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">
              Read Only
            </span>
          )}
        </div>

        <button
          onClick={handleFullscreen}
          className="p-1.5 rounded-md hover:bg-[#1a1520] text-[#6b6560] hover:text-[#e8e6e3] transition-all"
          title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
        >
          {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
        </button>
      </div>

      <div
        className="w-full h-full"
        style={{
          minHeight: isFullscreen ? "100vh" : "500px",
          paddingTop: "40px",
        }}
      >
        <Editor
          ref={editorRef}
          height="100%"
          language={getMonacoLanguage()}
          value={value}
          onChange={(val) => onChange(val || "")}
          theme="vs-dark"
          options={editorOptions}
          loading={
            <div className="flex items-center justify-center h-full text-[#44403c] text-xs font-medium animate-pulse">
              Loading Editor...
            </div>
          }
        />
      </div>
    </div>
  );
}

export default CodeEditor;
