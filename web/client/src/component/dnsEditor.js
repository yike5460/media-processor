import React, { FunctionComponent, useState } from 'react';
import { EditForm, IEditFormValue } from 'iblis-simple-crud';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import { makeStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Avatar from '@material-ui/core/Avatar';
import ImageIcon from '@material-ui/icons/Image';
import WorkIcon from '@material-ui/icons/Work';
import Divider from '@material-ui/core/Divider';

export const BasicUsage: FunctionComponent = () => {

  const pushValue: IEditFormValue = { id: 1, value: 'Test1' };
  const pullValue : IEditFormValue= { id: 1, value: 'Test2' };
  const [pushdataValue, setPushDataValue] = useState(pushValue);
  const [pulldataValue, setPullDataValue] = useState(pullValue);
  const useStyles = makeStyles((theme) => ({
    root: {
      width: '100%',
      maxWidth: 500,
      backgroundColor: theme.palette.background.paper,
    },
  }));
  const editPullAction = (form: IEditFormValue) => {
    console.log(JSON.stringify(form));
    setPushDataValue(form);

  };

  const editPushAction = (form: IEditFormValue) => {
    console.log(JSON.stringify(form));
    setPullDataValue(form);
  };


  const classes = useStyles();
  return <div width="50%" className={classes.root}>

<List className={classes.root}>
      <ListItem>
        <ListItemAvatar>
          <Avatar>
            <ImageIcon />
          </Avatar>
        </ListItemAvatar>
     
        <EditForm initValue={pushdataValue}
      editLabel={'更新'}
      editConfirmLabel={'确认'}
      editCancelLabel={'取消'}
      editAction={editPullAction}
  
      hasDelete={false}
      // componentHeight={120}
      componentWidth={500}
      leftComponent={<ListItemText primary="推流域名："  />}
    />
      </ListItem>
      <Divider variant="inset" component="li" />
      <ListItem>
        <ListItemAvatar>
          <Avatar>
            <WorkIcon />
          </Avatar>
        </ListItemAvatar>
        <ListItemText primary="Work" secondary="Jan 7, 2014" />
      </ListItem>
      <Divider variant="inset" component="li" />

    </List>
      <List component="nav" className={classes.root} aria-label="mailbox folders">
      <ListItem button>
         

      </ListItem>
      <Divider />
      <ListItem button divider>
            <EditForm initValue={pulldataValue}
      editLabel={'更新'}
      editConfirmLabel={'确认'}
      editCancelLabel={'取消'}
      editAction={editPushAction}
     
      hasDelete={false}
      leftComponent={<Box width={'100%'} display={'flex'} justifyContent={'center'}>
        <Typography variant={'body1'}>拉流域名：</Typography></Box>}
    /> 
      </ListItem>

    </List>

 

  </div>
};

export default BasicUsage;