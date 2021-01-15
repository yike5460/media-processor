import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import { Container } from "@material-ui/core";
// import DNSEditor from './dnsEditor';
import AppsIcon from '@material-ui/icons/Apps';
import { Toolbar } from "@material-ui/core";
import App from './metadata';
import StoreMetaData from './store-metadata';
import WaterMark from './watermark.js';
import Motion from './motion.js';
import DnsForm from './dnsEditor.js';

function TabPanel(props) {
    const { children, value, index, ...other } = props;
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`scrollable-auto-tabpanel-${index}`}
            aria-labelledby={`scrollable-auto-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box p={3}>
                    {children}
                </Box>
            )}
        </div>
    );
}

TabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.any.isRequired,
    value: PropTypes.any.isRequired,
};

function a11yProps(index) {
    return {
        id: `scrollable-auto-tab-${index}`,
        'aria-controls': `scrollable-auto-tabpanel-${index}`,
    };
}

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
        width: '100%',
        backgroundColor: theme.palette.background.paper,
    },
}));

export default function ScrollableTabsButtonAuto() {
    const classes = useStyles();
    const [value, setValue] = React.useState(0);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    return (
        <div className={classes.root} >
            <AppBar position="static" color="inherit">
                <Toolbar>
                    <AppsIcon />
                    <Typography variant="h5" color="inherit">
                        视频流管理
                    </Typography>
                    <Tabs
                        value={value}
                        onChange={handleChange}
                        indicatorColor="primary"
                        textColor="inherit"
                        variant="scrollable"
                        scrollButtons="auto"
                        aria-label="scrollable auto tabs example"
                    >
                        <Tab label="配置管理" {...a11yProps(0)} />
                        <Tab label="录制管理" {...a11yProps(1)} />
                        <Tab label="水印配置" {...a11yProps(2)} />
                        <Tab label="移动侦测" {...a11yProps(3)} />
                        {/* <Tab label="域名配置" {...a11yProps(4)} /> */}

                    </Tabs>
                </Toolbar>
            </AppBar>
            <TabPanel value={value} index={0}>
                <App />
            </TabPanel>
            <TabPanel value={value} index={1}>
                <StoreMetaData />
            </TabPanel>
            <TabPanel value={value} index={2}>
                <WaterMark />
            </TabPanel>
            <TabPanel value={value} index={3}>
                <Motion />
            </TabPanel>
            {/* <TabPanel value={value} index={4}>
              <DnsForm/>
            </TabPanel> */}

            <AppBar position="static" color="inherit">
                <Container maxWidth="md">
                    <Toolbar>
                        <Typography align="center" variant="body1" >
                        </Typography>
                    </Toolbar>
                </Container>
            </AppBar>
        </div>
    );
}
