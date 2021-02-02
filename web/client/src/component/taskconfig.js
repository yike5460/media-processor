import React, { useState, useEffect } from 'react';
import Grid from '@material-ui/core/Grid'
import MaterialTable from "material-table";
import Refresh from '@material-ui/icons/Refresh';
import axios from 'axios'
import Alert from '@material-ui/lab/Alert';
import 'react-tabs/style/react-tabs.css';
import Switch from '@material-ui/core/Switch';
import tableIcons from './tableIcon.js'
import './App.css';


const api = axios.create({
    //baseURL: `http://localhost:8080`
})


function App() {
    var columns = [
        { title: "名称", field: "videoname", editable: 'never' },
        { title: "集群模式", field: "isCluster", type: 'boolean', initialEditValue: false, render: rowData => rowData.isCluster === true ? <Switch size="small" checked={true} /> : <Switch size="small" checked={false} /> },
        { title: "主任务类型", field: "masterSize", lookup: { 'small': 'small', 'medium': 'medium', 'large': 'large', 'xlarge': 'xlarge'}},
        { title: "副任务类型", field: "slaveSize", lookup: { 'micro': 'micro','small': 'small', 'medium': 'medium', 'large': 'large', 'xlarge': 'xlarge'}},
        { title: "副任务数量", field: "clusterNumber", type: 'numeric', initialEditValue: 1 },
        { title: "日志输出", field: "logLevel", lookup: { quiet: 'quiet', panic: 'panic', error: 'error', warning: 'warning', info: 'info', verbose: 'verbose', debug: 'debug', trace: 'trace' } },
    ]

    const [data, setData] = useState([]); //table data
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
            if (newData.masterSize === 'small') {
                newData.cpu = 512;
                newData.memory = 1024
            }
           else if (newData.masterSize === 'medium') {
                newData.cpu = 1024;
                newData.memory = 2048
            }
           else if (newData.masterSize === 'large') {
                newData.cpu = 2048;
                newData.memory = 4096
            }
           else if (newData.masterSize === 'xlarge') {
                newData.cpu = 4096;
                newData.memory = 8192
            }
            if (newData.slaveSize === 'micro') {
                newData.slave_cpu = 256;
                newData.slave_memory = 512
            }
           else if (newData.slaveSize === 'small') {
                newData.slave_cpu = 512;
                newData.slave_memory = 1024
            }
           else if (newData.slaveSize === 'medium') {
                newData.slave_cpu = 1024;
                newData.slave_memory = 2048
            }
           else if (newData.slaveSize === 'large') {
                newData.slave_cpu = 2048;
                newData.slave_memory = 4096
            }
           else if (newData.slaveSize === 'xlarge') {
                newData.slave_cpu = 4096;
                newData.slave_memory = 8192
            }

            if (newData.slaveSize === 'small') {
                newData.slave_cpu = 512;
                newData.slave_memory = 1024
            }
           else if (newData.slaveSize === 'medium') {
                newData.slave_cpu = 1024;
                newData.slave_memory = 2048
            }
           else if (newData.slaveSize === 'large') {
                newData.slave_cpu = 2048;
                newData.slave_memory = 4096
            }
           else if (newData.slaveSize === 'xlarge') {
                newData.slave_cpu = 4096;
                newData.slave_memory = 8192
            }

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
                        }}
                        align="center"
                        title="配置管理"
                        columns={columns}
                        data={data}
                        icons={tableIcons}
                        style={{ padding: '0 10px' }}
                        editable={{
                            onRowUpdate: (newData, oldData) =>
                                new Promise((resolve) => {
                                    handleRowUpdate(newData, oldData, resolve);
                                })
                        }}
                    />
                </Grid>
            </Grid>
        </div>

    );
}

export default App;