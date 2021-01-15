import React, { useState } from 'react';
import FormikForm from './FormikForm';

function DnsForm() {
  const [fields, updateFields] = useState(
    {
      pushDns: 'push.aws.com',
      pullDns: 'pull.aws.com',
    }
  );

  return (
    <div className="container">
      <FormikForm fields={fields} updateFields={updateFields}/>
    </div>
  );
}

export default DnsForm;