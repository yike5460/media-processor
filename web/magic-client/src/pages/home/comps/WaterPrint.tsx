import React, { useState } from "react";
import { RadioGroup, Radio } from "@blueprintjs/core";

enum WaterPrintEnum {
  TEXT = "TEXT",
  IMAGE = "IMAGE",
}

const WaterPrint: React.FC = (): JSX.Element => {
  const [waterPrintType, setWaterPrintType] = useState<string>(
    WaterPrintEnum.TEXT
  );

  return (
    <>
      <div className="flex mt-10">
        <div className="mr-10">
          <b>视频水印</b>
        </div>
        <div className="flex1">
          <RadioGroup
            inline
            onChange={(event) => {
              const radioEvent = event as React.ChangeEvent<HTMLInputElement>;
              // console.info(event.target.value);
              setWaterPrintType(radioEvent.target.value);
            }}
            selectedValue={waterPrintType}
          >
            <Radio label="文字水印" value={WaterPrintEnum.TEXT} />
            <Radio label="图片水印" value={WaterPrintEnum.IMAGE} />
          </RadioGroup>
        </div>
      </div>
      {waterPrintType === WaterPrintEnum.IMAGE && (
        <div className="pr flex water-settings">
          <div className="item">
            <label>图片URL:</label>
            <div>
              <input
                placeholder="http://link/abc.jpg"
                className="pt-input .modifier pr-10"
                type="text"
              />
            </div>
          </div>
          <div className="item">
            <label>图片宽度:</label>
            <div>
              <input
                placeholder="100px"
                className="pt-input .modifier pr-10"
                type="text"
              />
            </div>
          </div>
          <div className="item">
            <label>图片高度:</label>
            <div>
              <input
                placeholder="50px"
                className="pt-input .modifier pr-10"
                type="text"
              />
            </div>
          </div>
          <div className="item">
            <label>上间距:</label>
            <div>
              <input
                placeholder="40px"
                className="pt-input .modifier pr-10"
                type="text"
              />
            </div>
          </div>
          <div className="item">
            <label>左间距:</label>
            <div>
              <input
                placeholder="70px"
                className="pt-input .modifier pr-10"
                type="text"
              />
            </div>
          </div>
        </div>
      )}
      {waterPrintType === WaterPrintEnum.TEXT && (
        <div className="pr flex water-settings">
          <div className="item">
            <label>水印文字:</label>
            <div>
              <input
                placeholder="例:亚马逊云科技"
                className="pt-input .modifier pr-10"
                type="text"
              />
            </div>
          </div>
          <div className="item">
            <label>文字大小:</label>
            <div>
              <input
                placeholder="18px"
                className="pt-input .modifier pr-10"
                type="text"
              />
            </div>
          </div>
          <div className="item">
            <label>文字颜色:</label>
            <div>
              <input
                placeholder="#CDCDCD"
                className="pt-input .modifier pr-10"
                type="text"
              />
            </div>
          </div>
          <div className="item">
            <label>上间距:</label>
            <div>
              <input
                placeholder="40px"
                className="pt-input .modifier pr-10"
                type="text"
              />
            </div>
          </div>
          <div className="item">
            <label>左间距:</label>
            <div>
              <input
                placeholder="60px"
                className="pt-input .modifier pr-10"
                type="text"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default WaterPrint;
