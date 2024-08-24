import { CheckCircle, FilePlus } from "lucide-react";
import { useDropzone, FileWithPath } from "react-dropzone";
import { Button, buttonVariants } from "./ui/button";
import { cn } from "@/lib/utils";
import { useXmpp } from "@/lib/hooks/useXmpp";

const FileUpload = () => {
  const { requestUploadSlot, selectedContact, selectedGroup, selectedType } =
    useXmpp();
  const { acceptedFiles, getRootProps, getInputProps } = useDropzone({});

  function shortPath(path: string | undefined) {
    // use ... to shorten the path
    if (!path) return "";

    return path.length > 20 ? `...${path.slice(-20)}` : path;
  }

  const acceptedFileItems = acceptedFiles.map((file: FileWithPath) => (
    <div key={file.path} className="flex flex-row">
      {`->`} {shortPath(file.name)}
    </div>
  ));

  const handleUpload = () => {
    if (selectedType === "group" && selectedGroup) {
      acceptedFiles.forEach((file) => {
        requestUploadSlot(file, selectedGroup!.jid);
      });
    } else if (selectedType === "contact" && selectedContact) {
      acceptedFiles.forEach((file) => {
        requestUploadSlot(file, selectedContact!.jid);
      });
    }
    // Clear the files after upload
    acceptedFiles.splice(0, acceptedFiles.length);
  };

  return (
    <div className="p-2 grid gap-2">
      <div
        {...getRootProps({
          className:
            "rounded-lg bg-card text-card-foreground flex justify-center items-center hover:bg-border/60 transition duration-150 ease-in-out cursor-pointer text-center w-full",
        })}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col justify-center items-center gap-6 py-8 text-sm truncate px-0 w-full">
          {acceptedFiles.length > 0 ? (
            <>
              <CheckCircle
                className="relative h-10 w-10 opacity-40"
                aria-hidden="true"
              />
              <div className="truncate w-50">
                {acceptedFileItems.map((file) => file)}
              </div>
              <p className="opacity-60">Drop/click to replace</p>
            </>
          ) : (
            <>
              <FilePlus
                className="relative h-10 w-10 opacity-70"
                aria-hidden="true"
              />
              <p>Drop/click to select a file</p>
            </>
          )}
        </div>
      </div>
      {acceptedFiles.length > 0 && (
        <Button
          className={cn(buttonVariants({ variant: "secondary" }))}
          onClick={handleUpload}
        >
          Upload
        </Button>
      )}
    </div>
  );
};

export default FileUpload;
