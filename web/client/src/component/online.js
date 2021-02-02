import React, { useState, useEffect } from 'react';
import './App.css';
import Grid from '@material-ui/core/Grid'
import MaterialTable from "material-table";
import Refresh from '@material-ui/icons/Refresh';

import axios from 'axios'

import 'react-tabs/style/react-tabs.css';
import Switch from '@material-ui/core/Switch';
import tableIcons from './tableIcon.js'


const api = axios.create({
    //baseURL: `http://localhost:8080`
})


function App() {
    var columns = [
        { title: "名称", field: "Name"},
        { title: "FLV输出", field: "isFlv", type: 'boolean', render: rowData => rowData.isFlv === true ? <Switch size="small" checked={true} /> : <Switch size="small" checked={false} /> },
        { title: "HLS输出", field: "isHls", type: 'boolean',   render: rowData => rowData.isHls === true ? <Switch size="small" checked={true} /> : <Switch size="small" checked={false} /> },
        { title: "CMAF输出", field: "isCMAF", type: 'boolean',   render: rowData => rowData.isCMAF === true ? <Switch size="small" checked={true} /> : <Switch size="small" checked={false} /> },
        { title: "图像输出", field: "isImage", type: 'boolean',   render: rowData => rowData.isImage === true ? <Switch size="small" checked={true} /> : <Switch size="small" checked={false} /> },

    ]
    const [data, setData] = useState([]); //table data
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        setIsLoading(true)
        api.get("/videostreams/online")
            .then(res => {
                 console.log(res);
                setData(res.data.data)
            })
            .catch(error => {
                console.log("Error")
            })
        setIsLoading(false)
    }, [])

    const refresh = (resolve) => {
        setIsLoading(true)
        api.get("/videostreams/online")
            .then(res => {
                setData(res.data.data)
            })
            .catch(error => {
                console.log("Error")
            })
        setIsLoading(false)
    }

    const tableRef = React.createRef();

    const [selectedRow, setSelectedRow] = useState(null);

    return (
        <div className="App"  >
            <Grid container justify="center" style={{ backgroundColor: '#grey', padding: 2 }}>

                <Grid item xs  >
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
                    />
                </Grid>
            </Grid>
        </div>

    );
}

export default App;