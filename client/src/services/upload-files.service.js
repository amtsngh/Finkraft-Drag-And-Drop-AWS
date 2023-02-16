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

  update(files) {
    let formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file, file.path);
    });
    return http.post("/update", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  }
}

export default new UploadFilesService();
