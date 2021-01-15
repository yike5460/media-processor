import React, { useState, useEffect } from 'react';
import './App.css';
import Grid from '@material-ui/core/Grid'
import MaterialTable from "material-table";
import Refresh from '@material-ui/icons/Refresh';
import AccountCircle from '@material-ui/icons/AccountCircle';
 import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Avatar from '@material-ui/core/Avatar';
import ImageIcon from '@material-ui/icons/Image';
import axios from 'axios'
import Alert from '@material-ui/lab/Alert';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import Iframe from 'react-iframe'
import Player from './player';
import ClapprPlayer from './clappr-player';
import Switch from '@material-ui/core/Switch';
import tableIcons from './tableIcon'



const api = axios.create({
  //baseURL: `http://localhost:8080`
})


function App() {
  var columns = [
    // {title: "视频流ID", field: "id",editable: 'never',cellStyle:{backgroundColor: "green" }},
    // {title: "签名KEY",  field: "key",editable: 'never',      headerStyle: {
    //       backgroundColor: "green"       
    //   }},
    { title: "名称", field: "videoname" },
    { title: "视频ID", field: "id", editable: 'never', hidden: true },
    { title: "签名KEY", field: "key", editable: 'never', hidden: true },
    { title: "推流域名", field: "pushDNS" },
    { title: "播放域名", field: "pullDNS" },
    { title: "过期时间", field: "outdate", type: 'date' },
    { title: "FLV输出", field: "isFlv", type: 'boolean', initialEditValue: true, render: rowData => rowData.isFlv === true ?   <Switch size="small" checked={true} /> : <Switch size="small" checked={false} /> },
    { title: "HLS输出", field: "isHls", type: 'boolean', initialEditValue: false, render: rowData => rowData.isHls === true ?   <Switch size="small" checked={true} /> : <Switch size="small" checked={false} /> },
    { title: "CMAF输出", field: "isCMAF", type: 'boolean', render: rowData => rowData.isCMAF === true ?   <Switch size="small" checked={true} /> : <Switch size="small" checked={false} /> },
    { title: "HLS输出数量", field: "hls_list_size", type: 'numeric', initialEditValue: '6' },
    { title: "HLS输出频率", field: "hls_time", type: 'numeric', initialEditValue: '3' },
  ]
  const [data, setData] = useState([]); //table data
  //for error handling
  const [iserror, setIserror] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessages, setErrorMessages] = useState([])

  useEffect(() => {
    setIsLoading(true)
    api.get("/videostreams")
      .then(res => {
        // console.log(res);
        setData(res.data.data)
      })
      .catch(error => {
        console.log("Error")
      })
    setIsLoading(false)
  }, [])

  const refresh = (resolve) => {
    setIsLoading(true)
    api.get("/videostreams")
      .then(res => {
        setData(res.data.data)
        resolve()
      })
      .catch(error => {
        console.log("Error")
      })
    setIsLoading(false)
  }

  const handleRowUpdate = (newData, oldData, resolve) => {
    setIsLoading(true)
    let errorList = []
    // if(newData.first_name === ""){
    //   errorList.push("Please enter first name")
    // }

    if (errorList.length < 1) {
      //  
      const id = newData.id;
      const key = newData.key;

      delete newData['TimeStamp'];
      delete newData['key'];
      delete newData['id'];
      console.log(newData)
      api.put("/videostreams/" + id, newData)
        .then(res => {
          console.log('update row:' + JSON.stringify(res));
          const dataUpdate = [...data];
          const index = oldData.tableData.id;
          newData.id = id;
          newData.key = key;
          dataUpdate[index] = newData;
          setData([...dataUpdate]);
          resolve()
          setIserror(false)
          setErrorMessages([])
        })
        .catch(error => {
          setErrorMessages(["Update failed! Server error"])
          setIserror(true)
          resolve()

        })
    } else {
      setErrorMessages(errorList)
      setIserror(true)
      resolve()
    }
    setIsLoading(false)
  }

  const handleRowAdd = (newData, resolve) => {
    //validation

    let errorList = []
    if (newData.outdate === undefined) {
      errorList.push("请输入过期时间")
    }
    // if (newData.last_name === undefined) {
    //   errorList.push("Please enter last name")
    // }
    // if (newData.email === undefined) {
    //   errorList.push("Please enter a valid email")
    // }

    if (errorList.length < 1) { //no error
      let outDate = new Date(newData.outdate);
      var datestring = outDate.getFullYear() + "/" + (outDate.getMonth() + 1) + "/" + outDate.getDate()
      newData.outdate = datestring;
      api.post("/videostreams", newData)
        .then(res => {
          console.log(res);
          let dataToAdd = [...data];
          dataToAdd.push(res.data);
          setData(dataToAdd);
          resolve()
          setErrorMessages([])
          setIserror(false)
        })
        .catch(error => {
          setErrorMessages(["Cannot add data. Server error!"])
          setIserror(true)
          resolve()
        })
    } else {
      setErrorMessages(errorList)
      setIserror(true)
      resolve()
    }

  }

  const handleRowDelete = (oldData, resolve) => {

    api.delete("/videostreams/" + oldData.id)
      .then(res => {
        const dataDelete = [...data];
        const index = oldData.tableData.id;
        dataDelete.splice(index, 1);
        setData([...dataDelete]);
        resolve()
      })
      .catch(error => {
        setErrorMessages(["Delete failed! Server error"])
        setIserror(true)
        resolve()
      })
  }
  const tableRef = React.createRef();

  const [selectedRow, setSelectedRow] = useState(null);

  return (
    <div className="App"  >
      <Grid container justify="center" style={{ backgroundColor: '#grey', padding: 2 }}>

        <Grid item xs  >
          <div>
            {iserror &&
              <Alert severity="error">
                {errorMessages.map((msg, i) => {
                  return <div key={i}>{msg}</div>
                })}
              </Alert>
            }
          </div>
          <MaterialTable
            isLoading={isLoading}
            tableRef={tableRef}
            actions={[
              {
                icon: Refresh,
                tooltip: '刷新',
                isFreeAction: true,
                onClick: () => refresh()
              }
            ]}
            onRowClick={((evt, selectedRow) => setSelectedRow(selectedRow.tableData.id))}
            options={{
              paging: true,  // 是否显示分页插件
              exportButton: true,  //是否显示导出按钮
              actionsColumnIndex: 0,  // actions显示在最后一列
              addRowPosition: "first",  // 点击添加行时显示在首行
              rowStyle: rowData => ({
                backgroundColor: (selectedRow === rowData.tableData.id) ? '#DDD' : '#EEE',
                fontSize: 13
              }),
              headerStyle: {
                backgroundColor: '#3F516C',
                color: '#FFFFFF',
                fontSize: 14,
                // padding: 10
              },
              // style={{ backgroundColor: '#grey',  }}
              //   rowStyle: {
              //     backgroundColor: '#EEE',
              //   }
            }}

            align="center"
            title="配置管理"
            columns={columns}
            data={data}
            icons={tableIcons}
            style={{ padding: '0 10px' }}
            detailPanel={[
              {
                tooltip: '地址信息',
                render: rowData => {
                  return (
                    <div style={{
                      width: '100%',
                      backgroundColor: 'EEEFFF',
                    }}>
                      <List >
                        <ListItem>
                          <ListItemAvatar>
                            <Avatar>
                              <ImageIcon />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText primary="推流地址:" secondary={`rtmp://${rowData.pushDNS}:1935/stream/${rowData.id}?sign=${rowData.key}`} />
                        </ListItem>
                        <ListItem>
                          <ListItemAvatar>
                            <Avatar>
                              <ImageIcon />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText primary="HLS拉流地址:" secondary={`http://${rowData.pullDNS}/${rowData.id}/live.m3u8`} />
                        </ListItem>
                        <ListItem>
                          <ListItemAvatar>
                            <Avatar>
                              <ImageIcon />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText primary="FLV拉流地址:" secondary={`http://${rowData.pullDNS}/${rowData.id}/live.flv`} />
                        </ListItem>
                        <ListItem>
                          <ListItemAvatar>
                            <Avatar>
                              <ImageIcon />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText primary="CMAF HLS拉流地址:" secondary={`http://${rowData.pullDNS}/${rowData.id}/master.m3u8`} />
                        </ListItem>
                        <ListItem>
                          <ListItemAvatar>
                            <Avatar>
                              <ImageIcon />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText primary="CMAF DASH拉流地址:" secondary={`http://${rowData.pullDNS}/${rowData.id}/manifest.mpd`} />
                        </ListItem>

                      </List>
                      {/* <Typography variant="body1" display="block" gutterBottom>
                        推流地址:rtmp://{rowData.pushDNS}:1935/stream/{rowData.id}?sign={rowData.key}
                      </Typography>
                      <Typography variant="body1" display="block" gutterBottom>
                        HLS拉流地址:<a href={`http://${rowData.pullDNS}/${rowData.id}/index.html`} target="_blank" rel="noopener noreferrer">http://{rowData.pullDNS}/{rowData.id}/live.m3u8</a>
                      </Typography>
                      <Typography variant="body1" display="block" gutterBottom>
                        FLV拉流地址:<a href={`http://${rowData.pullDNS}/${rowData.id}/flv.html`} target="_blank" rel="noopener noreferrer">http://{rowData.pullDNS}/{rowData.id}/live.flv</a>
                      </Typography> */}
                    </div>
                  )
                },
              },
              {
                icon: AccountCircle,
                tooltip: '视频播放',
                render: rowData => {
                  return (
                    <div>
                      <Tabs>
                        <TabList>
                          <Tab >FLV播放</Tab>
                          <Tab >HLS播放</Tab>
                          <Tab >CMAF播放</Tab>
                        </TabList>
                        <TabPanel >
                          {/* <Player
                            url={`http://${rowData.pullDNS}/${rowData.id}/live.flv`}
                          /> */}
                          <Iframe
                            id="flv"
                            allowFullScreen
                            display="FLV"
                            width="70%"
                            height="360"
                            position="relative"
                            src={`http://${rowData.pullDNS}/${rowData.id}/flv.html`}
                            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                          />
                        </TabPanel>
                        <TabPanel>
                        <Player
                            url={`http://${rowData.pullDNS}/${rowData.id}/live.m3u8`}
                          />
                        </TabPanel>
                        <TabPanel>
 
                        <ClapprPlayer src={`http://${rowData.pullDNS}/${rowData.id}/master.m3u8`} />
                     
                          {/* <Iframe
                            id="CMAF"
                            width="100%"
                            height="360"
                            display="initial"
                            position="relative"
                            url={`http://${rowData.pullDNS}/${rowData.id}/hls.html`}
                            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                          /> */}
                        </TabPanel>
                      </Tabs>
                    </div>
                  )
                },
              },

            ]}
            editable={{
              onRowUpdate: (newData, oldData) =>
                new Promise((resolve) => {
                  handleRowUpdate(newData, oldData, resolve);
                }),
              onRowAdd: (newData) =>
                new Promise((resolve) => {
                  handleRowAdd(newData, resolve)
                }),
              onRowDelete: (oldData) =>
                new Promise((resolve) => {
                  handleRowDelete(oldData, resolve)
                }),
            }}
          />
        </Grid>

      </Grid>


    </div>

  );
}

export default App;