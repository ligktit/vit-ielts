const maxSize = 2;

export function fileSizeValidator(file: File) {
    if (file.size > maxSize * 1024 * 1024) {
        return {
            code: "file-too-large",
            message: `File is larger than ${maxSize}MB`,
        };
    }

    return null;
}