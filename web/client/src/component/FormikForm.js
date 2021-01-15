import React, { Component } from 'react';
import { withFormik, Form, Field } from 'formik';
import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';
import axios from 'axios'

const form_id = 'form_id';

const api = axios.create({
    //baseURL: `http://localhost:8080`
  })



class MaintenanceForm extends Component {

    editOnClick = (event) => {
        event.preventDefault()
        const data = !(this?.props?.status?.edit)
        this.props.setStatus({
            edit: data,
        })
    }
    
    cancelOnClick = (event) => {
        event.preventDefault()
        this.props.resetForm()
        this.props.setStatus({
            edit: false,
        })
    }

    _renderAction() {
        return (
            
                <div style={{marginLeft: "8px", marginTop:"8px"}}>
                    {
                        this?.props?.status?.edit ? 
                        <React.Fragment>
                            <Button variant="outlined" color="primary" type="submit" form={form_id}>保存</Button> 
                            <Button variant="outlined" color="primary" onClick={this.cancelOnClick} style={{marginLeft: "8px"}}>取消</Button>
                        </React.Fragment>
                        : 
                        <Button variant="outlined" color="primary" onClick={this.editOnClick}>编辑</Button> 
                    }
                </div>
             
        );
    }

    _renderFormView = () => {
        return (
            <React.Fragment>
                <div  >
                    <label >推流域名:</label>
                    <div  >
                        <label type="text" name="pushDns" className="form-control">
                            {this?.props?.fields?.pushDns}
                        </label>
                    </div>
                </div>
                <div >
                    <label>拉流域名:</label>
                    <div  >
                        <label type="text" name="pullDns" className="form-control"> 
                            {this?.props?.fields?.pullDns}
                        </label>
                    </div>
                </div>
            </React.Fragment>
        );
    }

    _renderFormInput = () => {
        return (
            <React.Fragment>
                <div >
                    <label>推流域名:</label>
                    <div>
                        <Field type="text" name="pushDns" className="form-control" placeholder="pushDns" />
                    </div>
                </div>
                <div  >
                    <label>拉流域名:</label>
                    <div>
                        <Field type="text" name="pullDns" className="form-control" placeholder="pullDns" />
                    </div>
                </div>
            </React.Fragment>        
        );
    }

    render() {
        return (
            <React.Fragment>
              
                <Form id={form_id}>
                    {
                        this?.props?.status?.edit 
                        ?
                        this._renderFormInput()
                        :
                        this._renderFormView()
                    }
                </Form>
                <Divider style={{marginTop:"8px"}}/>
                {this._renderAction()}
                <h4>Current value</h4>
                <div>
                    <pre>
                        <code>{JSON.stringify(this.props.fields, null, 2)}</code>
                    </pre>
                </div>
            </React.Fragment>
        );
    }
}

const FormikForm = withFormik({
    mapPropsToStatus: (props) =>  {
        return {
            edit: props?.edit || false,
        }
    },
    mapPropsToValues: (props) => {
        return {
            pushDns: props.fields.pushDns,
            pullDns: props.fields.pullDns,
        }
    }, 
    enableReinitialize: true,
    handleSubmit: (values, { props, ...actions }) => {
        console.log(values);
        // api.put("/videostreams/" + id, newData)
        // .then(res => {})
        // .catch(error => {
        // }
        props.updateFields(values);
        actions.setStatus({
            edit: false,
        });
    }
})(MaintenanceForm);

export default FormikForm;