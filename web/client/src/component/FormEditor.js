import React from 'react';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import Form from 'material-ui-form-builder';

const fields = [{ name: 'name', type: 'text' }, { name: 'limit', type: 'number' }];
const theme = createMuiTheme({
  palette: {
    primary: { main: '#8BC3D1' },
  },
});

export default function formEditor() {

  return (<div>
    <MuiThemeProvider theme={theme}>
      <Form
        fieldContainerStyle={{ backgroundColor: '#fefefe', padding: 10 }}
        onChange={(values) => console.log(values)}
        fields={fields}
        values={{ name: 'test', limit: 10 }}
        errors={{ limit: 'This field is required.' }}
      />
    </MuiThemeProvider>
  </div>)
}

export default formEditor;