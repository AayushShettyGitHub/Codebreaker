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
      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen();
      } else if (elem.msRequestFullscreen) {
        elem.msRequestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  React.useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, [isFullscreen]);

  const editorOptions = {
    minimap: { enabled: true },
    fontSize: 14,
    fontFamily: "'Fira Code', 'Jetbrains Mono', 'Courier New', monospace",
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
      className={`relative w-full transition-all duration-300 rounded-lg overflow-hidden shadow-lg border border-gray-300 ${
        isFullscreen ? "fixed inset-0 z-50 m-0 rounded-none" : "h-full min-h-[500px]"
      }`}
      style={{
        backgroundColor: "#ffffff",
      }}
    >
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between bg-gradient-to-b from-gray-100 to-gray-50 px-4 py-1.5 border-b border-gray-300 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 bg-gray-900 text-white text-xs font-bold rounded shadow-md">
            {getMonacoLanguage().toUpperCase()}
          </span>
          {disabled && (
            <span className="px-2 py-0.5 bg-yellow-600/40 text-yellow-200 text-xs rounded font-semibold">
              Read-only
            </span>
          )}
        </div>

        <button
          onClick={handleFullscreen}
          className="p-2 hover:bg-gray-200 rounded-lg transition-colors text-gray-700 hover:text-gray-900"
          title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
        >
          {isFullscreen ? (
            <Minimize2 size={18} />
          ) : (
            <Maximize2 size={18} />
          )}
        </button>
      </div>

      <div
        className="w-full h-full"
        style={{
          minHeight: isFullscreen ? "100vh" : "500px",
          paddingTop: "20px",
        }}
      >
        <Editor
          ref={editorRef}
          height="100%"
          language={getMonacoLanguage()}
          value={value}
          onChange={(val) => onChange(val || "")}
          theme="vs-light"
          options={editorOptions}
          loading={<div className="flex items-center justify-center h-full text-gray-500">Loading editor...</div>}
        />
      </div>
    </div>
  );
}
;

export default CodeEditor;
