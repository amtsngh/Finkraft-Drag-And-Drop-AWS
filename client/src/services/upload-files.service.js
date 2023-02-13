import http from "../http-common";

class UploadFilesService {
  upload(files, onUploadProgress) {
    let formData = new FormData();

    files.forEach((file) => {
      formData.append("files", file, file.path);
    });
    return http.post("/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress,
    });
  }

  getFiles() {
    return http.get("/get");
  }

  download() {
    return http.get("/download");
  }
}

export default new UploadFilesService();
