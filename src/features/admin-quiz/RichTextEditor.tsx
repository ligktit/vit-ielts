import dynamic from "next/dynamic";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

const MODULES = {
    toolbar: [
        ["bold", "italic", "underline", "strike"],
        [{ list: "ordered" }, { list: "bullet" }],
        ["link"],
        ["clean"],
    ],
};

const FORMATS = [
    "bold",
    "italic",
    "underline",
    "strike",
    "list",
    "link",
];

type RichTextEditorProps = {
    value: string;
    onChange: (html: string) => void;
    placeholder?: string;
};

export default function RichTextEditor({
    value,
    onChange,
    placeholder,
}: RichTextEditorProps) {
    return (
        <ReactQuill
            theme="snow"
            value={value}
            onChange={onChange}
            modules={MODULES}
            formats={FORMATS}
            placeholder={placeholder}
        />
    );
}
