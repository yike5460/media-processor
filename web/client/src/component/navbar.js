import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import App from './table';
import { Container } from "@material-ui/core";
// import DNSEditor from './dnsEditor';
import AppsIcon from '@material-ui/icons/Apps';

import { Toolbar } from "@material-ui/core";



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
        <div className={classes.root}>

            <AppBar position="static" >
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
                        <Tab label="域名管理" {...a11yProps(1)} />
                        <Tab label="直播" {...a11yProps(2)} />
                    </Tabs>
                </Toolbar>
            </AppBar>
            <TabPanel value={value} index={0}>
                <App />
            </TabPanel>
            <TabPanel value={value} index={1}>

            </TabPanel>
            <TabPanel value={value} index={2}>
                sadfasdf
            </TabPanel>
            <AppBar position="static"  >
                <Container maxWidth="md">
                    <Toolbar>
                        <Typography variant="body1" color="inherit">
                            Copyright © Your Website 2021.
                                    </Typography>
                    </Toolbar>
                </Container>
            </AppBar>
        </div>
    );
}
