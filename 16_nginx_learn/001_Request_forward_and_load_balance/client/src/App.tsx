import { useState } from "react";
import { Button } from "antd";

import "./App.css";

const baseURI = "http://localhost:8080/ybb"; // 配置为nginx地址

function App() {
  const [msg, setMsg] = useState("");
  return (
    <>
      <h3>结果：{msg}</h3>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <p>
          <Button
            type='primary'
            onClick={() => {
              fetch("/ybb/api/admin", {
                method: "GET",
                headers: new Headers({ "Content-Type": "text/plain" }),
              })
                .then()
                .then((res) => {
                  console.log(res, "res");
                })
                .catch((err) => {
                  console.log(err);
                });
            }}
          >
            3000端口发送请求，路径为/api/admin
          </Button>
          <Button type='primary'>
            3000端口发送请求，路径为/api/admin/login
          </Button>
        </p>
        <br />
        <p>
          <Button
            type='primary'
            onClick={() => {
              fetch("/ybb/admin", {
                method: "GET",
                headers: new Headers({ "Content-Type": "text/plain" }),
              })
                .then((res) => {
                  return res.text(); // 返回文本值
                })
                .then((text) => {
                  console.log(text); // 输出文本值
                })
                .catch((err) => {
                  console.log(err);
                });
            }}
          >
            6666端口发送请求，路径为/admin
          </Button>
          <Button type='primary'>6666端口发送请求，路径为/admin/login</Button>
        </p>
      </div>
    </>
  );
}

export default App;
