import React, { useState, useEffect } from 'react';
import './App.css';
import { forwardRef } from 'react';
import Grid from '@material-ui/core/Grid'
import MaterialTable from "material-table";
import AddBox from '@material-ui/icons/AddBox';
import ArrowDownward from '@material-ui/icons/ArrowDownward';
import Check from '@material-ui/icons/Check';
import ChevronLeft from '@material-ui/icons/ChevronLeft';
import ChevronRight from '@material-ui/icons/ChevronRight';
import Clear from '@material-ui/icons/Clear';
import DeleteOutline from '@material-ui/icons/DeleteOutline';
import Edit from '@material-ui/icons/Edit';
import FilterList from '@material-ui/icons/FilterList';
import FirstPage from '@material-ui/icons/FirstPage';
import LastPage from '@material-ui/icons/LastPage';
import Remove from '@material-ui/icons/Remove';
import SaveAlt from '@material-ui/icons/SaveAlt';
import Search from '@material-ui/icons/Search';
import Refresh from '@material-ui/icons/Refresh';
import AccountCircle from '@material-ui/icons/AccountCircle';
import FavoriteBorder from '@material-ui/icons/FavoriteBorder';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Avatar from '@material-ui/core/Avatar';
import ImageIcon from '@material-ui/icons/Image';
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';

import ViewColumn from '@material-ui/icons/ViewColumn';
import axios from 'axios'
import Alert from '@material-ui/lab/Alert';

import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';

const tableIcons = {
  Add: forwardRef((props, ref) => <AddBox {...props} ref={ref} />),
  Check: forwardRef((props, ref) => <Check {...props} ref={ref} />),
  Clear: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
  Delete: forwardRef((props, ref) => <DeleteOutline {...props} ref={ref} />),
  DetailPanel: forwardRef((props, ref) => <ChevronRight {...props} ref={ref} />),
  Edit: forwardRef((props, ref) => <Edit {...props} ref={ref} />),
  Export: forwardRef((props, ref) => <SaveAlt {...props} ref={ref} />),
  Filter: forwardRef((props, ref) => <FilterList {...props} ref={ref} />),
  FirstPage: forwardRef((props, ref) => <FirstPage {...props} ref={ref} />),
  LastPage: forwardRef((props, ref) => <LastPage {...props} ref={ref} />),
  NextPage: forwardRef((props, ref) => <ChevronRight {...props} ref={ref} />),
  PreviousPage: forwardRef((props, ref) => <ChevronLeft {...props} ref={ref} />),
  ResetSearch: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
  Search: forwardRef((props, ref) => <Search {...props} ref={ref} />),
  SortArrow: forwardRef((props, ref) => <ArrowDownward {...props} ref={ref} />),
  ThirdStateCheck: forwardRef((props, ref) => <Remove {...props} ref={ref} />),
  ViewColumn: forwardRef((props, ref) => <ViewColumn {...props} ref={ref} />),
  AccountCircle: forwardRef((props, ref) => <AccountCircle {...props} ref={ref} />),
  FavoriteBorder: forwardRef((props, ref) => <FavoriteBorder {...props} ref={ref} />),
  Refresh: forwardRef((props, ref) => <Refresh {...props} ref={ref} />),
  CheckBoxIcon: forwardRef((props, ref) => <CheckBoxIcon {...props} ref={ref} />),
  CheckBoxOutlineBlankIcon: forwardRef((props, ref) => <CheckBoxOutlineBlankIcon {...props} ref={ref} />)
};

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
    { title: "FLV输出", field: "isFlv", type: 'boolean', initialEditValue: true, render: rowData=>rowData.isFlv===true? <CheckBoxIcon />:<CheckBoxOutlineBlankIcon /> },
    { title: "HLS输出", field: "isHls", type: 'boolean', initialEditValue: false,render: rowData=>rowData.isHls===true? <CheckBoxIcon />:<CheckBoxOutlineBlankIcon />  },
    { title: "CMAF输出", field: "isCMAF", type: 'boolean' ,render: rowData=>rowData.isCMAF===true? <CheckBoxIcon />:<CheckBoxOutlineBlankIcon /> },
    { title: "水印输出", field: "isWaterMark", type: 'boolean', initialEditValue: false,render: rowData=>rowData.isWaterMark===true? <CheckBoxIcon />:<CheckBoxOutlineBlankIcon />  },
    { title: "截图", field: "isImage", type: 'boolean', initialEditValue: false ,render: rowData=>rowData.isImage===true? <CheckBoxIcon />:<CheckBoxOutlineBlankIcon /> },
    { title: "视频录制", field: "isVideo", type: 'boolean', initialEditValue: false,render: rowData=>rowData.isVideo===true? <CheckBoxIcon />:<CheckBoxOutlineBlankIcon />  },
    { title: "点播", field: "isOnDemand", type: 'boolean', initialEditValue: false,render: rowData=>rowData.isOnDemand===true? <CheckBoxIcon />:<CheckBoxOutlineBlankIcon />  },
    { title: "移动侦测", field: "isMotion", type: 'boolean', initialEditValue: false,render: rowData=>rowData.isMotion===true? <CheckBoxIcon />:<CheckBoxOutlineBlankIcon />  },
    { title: "HLS输出数量", field: "hls_list_size", type: 'numeric', initialEditValue: '6' },
    { title: "HLS输出频率", field: "hls_time", type: 'numeric', initialEditValue: '3' },
    { title: "水印文字", field: "WaterMarkText" },
    { title: "文字大小", field: "WaterMarkFontSize", type: 'numeric' },
    { title: "文字颜色", field: "WaterMarkFontColor" },
    { title: "截图频率", field: "image_time", type: 'numeric', initialEditValue: '30' },
    { title: "视频录制频率", field: "video_time", type: 'numeric', initialEditValue: '60' },
    { title: "像素变化", field: "motion_percent", type: 'numeric', initialEditValue: '30' },

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
                backgroundColor: '#666666',
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
                          <ListItemText primary="CMAF拉流地址:" secondary={`http://${rowData.pullDNS}/${rowData.id}/master.m3u8`} />
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
                          <iframe
                            title="flv"
                            width="100%"
                            height="470"
                            src={`http://${rowData.pullDNS}/${rowData.id}/flv.html`}
                            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                          />
                        </TabPanel>
                        <TabPanel>
                          <iframe
                            title="hls"
                            width="100%"
                            height="470"
                            src={`http://${rowData.pullDNS}/${rowData.id}/index.html`}

                            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"

                          />
                        </TabPanel>
                        <TabPanel>
                          <iframe
                            title="CMAF"
                            width="100%"
                            height="470"
                            src={`http://${rowData.pullDNS}/${rowData.id}/hls.html`}

                            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                          />
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