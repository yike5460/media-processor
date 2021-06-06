import React from "react";
import { Checkbox } from "@blueprintjs/core";
import { StreamType } from "assets/types/types";
interface RecordPropType {
  streamData: StreamType | undefined;
}
const Record: React.FC<RecordPropType> = (
  props: RecordPropType
): JSX.Element => {
  const { streamData } = props;
  return (
    <>
      {/* <div className="mt-5"></div> */}
      <div className="mt-10 pr">
        <b className="mr-10">视频录制</b>
        <Checkbox checked={streamData?.isImage === true} inline label="截图" />
        <Checkbox
          checked={streamData?.isVideo === true}
          inline
          label="MP4录制"
        />
        <Checkbox
          checked={streamData?.isOnDemand === true}
          inline
          label="HLS录制"
        />
      </div>
    </>
  );
};

export default Record;
