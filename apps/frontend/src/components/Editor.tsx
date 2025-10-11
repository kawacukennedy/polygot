import React from 'react';
import MonacoEditor from '@monaco-editor/react';

interface EditorProps {
  value: string;
  language: string;
  onChange: (value: string | undefined) => void;
}

const Editor: React.FC<EditorProps> = ({ value, language, onChange }) => {
  return (
    <div aria-label="Code editor">
      <MonacoEditor
        height="400px"
        language={language}
        value={value}
        onChange={onChange}
        theme="vs-dark"
        options={{
          minimap: { enabled: false },
          fontSize: 14,
        }}
      />
    </div>
  );
};

export default Editor;