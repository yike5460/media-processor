import React, { useState } from "react";
import { Switch } from "@blueprintjs/core";

const VideoBridge: React.FC = (): JSX.Element => {
  const [enabled, setEnabled] = useState(false);

  return (
    <>
      <div className="flex mt-10">
        <div className="mr-10">
          <b>视频中继</b>
        </div>
        <div className="">
          <Switch
            onChange={() => {
              setEnabled(!enabled);
            }}
            innerLabelChecked="开"
            innerLabel="关"
            checked={enabled}
            labelElement={<strong></strong>}
          />
        </div>
      </div>
      <div className="pr">
        {enabled && (
          <>
            <input placeholder="转播URL" className="pt-input" />
            <span className="qr-code"></span>
          </>
        )}
      </div>
    </>
  );
};

export default VideoBridge;
