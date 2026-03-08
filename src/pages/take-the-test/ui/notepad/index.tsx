import { Button } from "antd";
import { useExamContext } from "../../context";
import { useTextSelectionContext } from "@/shared/ui";

function Notepad() {
  const { setIsNotesViewOpen } = useExamContext();
  const { notes } = useTextSelectionContext()!;

  return (
    <div className="hidden md:block w-full h-full bg-white p-4 relative">
      <div className="absolute top-4 right-4">
        <Button
          shape="circle"
          htmlType="button"
          onClick={() => setIsNotesViewOpen(false)}
        >
          <span className="material-symbols-rounded block! text-xl!">
            close
          </span>
        </Button>
      </div>
      <h3 className="text-primary text-xl font-bold text-center">Notepad</h3>
      <div className="space-y-4 mt-4">
        {notes.map((note, index) => (
          <div key={index}>
            <p>
              <span>{index + 1}. </span>
              <span className="text-sm font-nunito font-bold text-primary underline">
                {note.text}
              </span>
            </p>
            <p>{note.nodeContent}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Notepad;
