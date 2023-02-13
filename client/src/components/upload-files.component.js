import React, { Component } from "react";
import Dropzone from "react-dropzone";

import UploadService from "../services/upload-files.service";
import csvDownload from "json-to-csv-export";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import ProgressBar from "@ramonak/react-progress-bar";

import DownloadIcon from "@mui/icons-material/Download";

export default class UploadFiles extends Component {
  constructor(props) {
    super(props);
    this.upload = this.upload.bind(this);
    this.onDrop = this.onDrop.bind(this);

    this.state = {
      selectedFiles: undefined,
      currentFile: undefined,
      progress: 0,
      message: "",
      fileInfos: {},
    };
  }

  componentDidMount() {
    UploadService.getFiles().then((response) => {
      this.setState({
        fileInfos: response.data,
      });
    });
  }

  upload() {
    let selectedFiles = this.state.selectedFiles;

    this.setState({
      progress: 0,
      selectedFiles: this.state.selectedFiles,
    });

    UploadService.upload(selectedFiles, (event) => {
      this.setState({
        progress: Math.round((100 * event.loaded) / event.total),
      });
    })
      .then((response) => {
        this.setState({
          message: response.data.message,
        });
        return UploadService.getFiles();
      })
      .then((files) => {
        this.setState({
          fileInfos: files.data,
        });
      })
      .catch(() => {
        this.setState({
          progress: 0,
          message: "Could not upload the file!",
          currentFile: undefined,
        });
      });

    this.setState({
      selectedFiles: undefined,
    });
  }

  onDrop(files) {
    if (files.length > 0) {
      this.setState({ selectedFiles: files });
    }
  }

  downloadFile() {
    UploadService.download().then((response) => {
      const dataToConvert = {
        data: response.data,
        filename: "FinkraftAWSFiles",
        delimiter: ",",
        headers: [
          "Key",
          "LastModified",
          "ETag",
          "Owner",
          "Size",
          "StorageClass",
          "Url",
          "Type",
        ],
      };
      csvDownload(dataToConvert);
    });
  }

  render() {
    const { selectedFiles, currentFile, progress, message, fileInfos } =
      this.state;

    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div
          className="container"
          style={{
            width: "900px",
            display: "flex",
            flexDirection: "column",
            marginBottom: "30px",
          }}
        >
          <div style={{ margin: "20px 0" }}>
            <h2 style={{ color: "#767676" }}>
              <span style={{ color: "#4ec5d6" }}>fin</span>kraft.ai
            </h2>
            <h6>
              The drag and drop upload feature is a user-friendly way to upload
              files to a website or application. It allows users to select one
              or multiple files from their computer, then drag and drop the
              files onto an area designated for file uploads. This method of
              uploading is convenient and simple, as it eliminates the need for
              users to manually browse and select files from their computer.{" "}
            </h6>
          </div>

          <Dropzone onDrop={this.onDrop} multiple={true}>
            {({ getRootProps, getInputProps }) => (
              <section>
                <div {...getRootProps({ className: "dropzone" })}>
                  <input {...getInputProps()} />
                  {selectedFiles && selectedFiles[0].name ? (
                    <div className="selected-file">
                      {selectedFiles.length > 1
                        ? selectedFiles[0].name +
                          " and " +
                          (selectedFiles.length - 1) +
                          " more file"
                        : selectedFiles[0].name}
                    </div>
                  ) : (
                    "Drag and drop your files here, or click to select files"
                  )}
                </div>
                <aside className="selected-file-wrapper">
                  <button
                    className="btn btn-success"
                    disabled={!selectedFiles}
                    onClick={this.upload}
                  >
                    Upload
                  </button>
                </aside>
              </section>
            )}
          </Dropzone>

          <div
            className="alert alert-light"
            role="alert"
            style={{ marginTop: "10px" }}
          >
            <ProgressBar completed={progress} />
            {message}
          </div>
        </div>
        {Object.keys(fileInfos).length > 0 && (
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell style={{ fontWeight: 700 }}>File Name</TableCell>
                  <TableCell align="right" style={{ fontWeight: 700 }}>
                    File Type
                  </TableCell>
                  <TableCell align="right" style={{ fontWeight: 700 }}>
                    Last Modified
                  </TableCell>
                  <TableCell align="right" style={{ fontWeight: 700 }}>
                    Size
                  </TableCell>
                  <TableCell align="right" style={{ fontWeight: 700 }}>
                    S3 ID
                  </TableCell>
                  <TableCell align="right">
                    <DownloadIcon
                      style={{ cursor: "pointer" }}
                      onClick={this.downloadFile}
                    />
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.keys(fileInfos).map((row) => (
                  <TableRow
                    key={row}
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell component="th" scope="row">
                      {row}
                    </TableCell>
                    <TableCell align="right">
                      {row.indexOf(".") > -1
                        ? row.substring(row.lastIndexOf(".") + 1, row.length)
                        : "Folder"}
                    </TableCell>
                    <TableCell align="right">
                      {fileInfos[row]["_fileInfo_"]["LastModified"]}
                    </TableCell>
                    <TableCell align="right">
                      {fileInfos[row]["_fileInfo_"]["Size"]}
                    </TableCell>
                    <TableCell align="right">
                      {fileInfos[row]["_fileInfo_"]["ETag"]}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </div>
    );
  }
}
