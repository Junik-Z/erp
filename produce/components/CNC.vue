<!-- #ifdef H5 -->
<script>
import { generateCNCProperties, getCNCProperties, getProduceDetailApi, updateCNCProperties } from "@/api/erp/produce";
import { Col, Form, FormItem, Input, InputNumber, Loading, Row } from "@/uni_modules/element-ui/element.min";
import { _deepCopy, _get, _isEmpty, CustomToast } from "@/utils";
import { CncCalculate } from "./cncCalculate";

export default {
  name: "CNC",
  data() {
    return {
      visible: false,
      loading: false,
      gLoading: false,
      form: {
        safeHeight: 50, // 安全高度
        spindleStart: "M03 S18000", // 启动主轴代码
        spindleStop: "M05", // 停止主轴代码
        startCode: "G90G56", // 开始代码
        toolChangeCode: "T1G43 H1", // 换刀代码
        xyCutSpeed: 10000, // XY轴切削速度
        xyRapidSpeed: 40000, // XY轴移动速度
        zcutSpeed: 3000, // Z轴切削速度
        zendCutHeight: -0.1, // Z轴结束切削高度
        zrapidSpeed: 5000, // Z轴快速移动速度
        zstartCutHeight: 28, // Z轴开始切削高度
      },
      rules: {},
      node: {},
      formData: {},
      boardRecord: {},
      CNC: {},

      cncLoading: false,
    };
  },
  directives: {
    Loading,
  },
  components: {
    Input,
    Form,
    FormItem,
    InputNumber,
    Row, Col,
  },
  created() {
    this.CNC = new CncCalculate({});

  },
  methods: {
    open(node) {
      this.node = node;
      this.getConfig();
      this.visible = true;
    },

    // 获取配置
    getConfig() {
      this.loading = true;
      getCNCProperties()
        .then(res => {
          this.form = res.data;
        })
        .finally(() => {
          this.loading = false;
        });
    },

    // 更新配置
    onSubmit() {
      this.$refs.FRef.validate((valid) => {
        if (valid) {
          updateCNCProperties(this.form)
            .then(res => {
              console.log(res);
              CustomToast({
                title: "更新成功",
              });
            });
        } else {
          console.log("error submit!!");
          return false;
        }
      });
    },

    // 生成NC程序
    onGenerate() {
      this.gLoading = true;
      getProduceDetailApi({id: this.node.id})
        .then(res => {
          const obj = _get(_deepCopy(res.data), "customizedBoards.0") || {};

          if (_isEmpty(obj)) {
            CustomToast({
              title: "该工单不需要进行板材加工",
              icon: "none",
            });

            this.gLoading = false;
            return false;
          }

          const boards = this.CNC.getSvg(obj);

          /*  if (obj) {
             this.$refs.NCN.innerHTML = boards[0].svgContent;

             this.gLoading = false;
             return false;
           } */

          generateCNCProperties({boards})
            .then(blob => {
              console.log(blob);
              this.saveZipFile(blob, `${res.data.orderCode}`);

              CustomToast({
                title: "生成成功",
              });
            })
            .finally(() => {
              this.gLoading = false;
            });
        })
        .catch(() => {
          this.gLoading = false;
        })
        .finally(() => {
        });
    },

    async saveZipFile(data, name) {
      const blob = new Blob([data], {
        type: "application/octet-stream;charset=UTF-8",
      });
      this.linkTodownloadFile(blob, name);
    },

    async linkTodownloadFile(blob, fName) {
      if (window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveBlob(blob, fName);
        return false;
      }
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.style.display = "none";
      link.href = url;
      link.setAttribute("download", fName + ".zip");
      document.body.appendChild(link);
      if (document.all) {
        link.click();
      } else {
        // 兼容 Firfox
        const evt = document.createEvent("MouseEvents");
        evt.initEvent("click", true, true);
        link.dispatchEvent(evt);
      }
      document.body.removeChild(link); // 下载完成移除元素
      window.URL.revokeObjectURL(url);
    },

    // 处理打印标签
    onPrintLabels() {
      this.$emit("print-label", _deepCopy(this.node));
    },
  },
};
</script>

<template>
  <BasicPopup :visible.sync="visible" title="NC配置">
    <view class="ko-cnc">
      <Form
        style="width: calc(100% - 20px);"
        :model="form"
        :rules="rules"
        v-loading="loading"
        label-width="150px"
        label-position="rigth"
        ref="FRef"
      >
        <Row>
          <Col :span="12">
            <FormItem label="开始代码" prop="startCode">
              <Input
                :autosize="{ minRows: 4, maxRows: 6}"
                type="textarea" v-model="form.startCode"
              />
            </FormItem>
          </Col>
          <Col :span="12">
            <FormItem label="启动主轴代码" prop="spindleStart">
              <Input
                :autosize="{ minRows: 4, maxRows: 6}"
                type="textarea" v-model="form.spindleStart"
              />
            </FormItem>
          </Col>
          <Col :span="12">
            <FormItem label="换刀代码" prop="toolChangeCode">
              <Input
                :autosize="{ minRows: 4, maxRows: 6}"
                type="textarea" v-model="form.toolChangeCode"
              />
            </FormItem>
          </Col>
          <Col :span="12">
            <FormItem label="停止主轴代码" prop="spindleStop">
              <Input
                :autosize="{ minRows: 4, maxRows: 6}"
                type="textarea" v-model="form.spindleStop"
              />
            </FormItem>
          </Col>
          <Col :span="12">
            <FormItem label="XY轴切削速度" prop="xyCutSpeed">
              <InputNumber style="text-align: left; width: 100%;" controls-position="right" v-model="form.xyCutSpeed" />
            </FormItem>
          </Col>
          <Col :span="12">
            <FormItem label="XY轴移动速度" prop="xyRapidSpeed">
              <InputNumber
                style="text-align: left; width: 100%;"
                controls-position="right"
                v-model="form.xyRapidSpeed"
              />
            </FormItem>
          </Col>
          <Col :span="12">
            <FormItem label="Z轴切削速度" prop="zcutSpeed">
              <InputNumber
                style="text-align: left; width: 100%;"
                controls-position="right"
                v-model="form.zcutSpeed"
              />
            </FormItem>
          </Col>
          <Col :span="12">
            <FormItem label="Z轴快速移动速度" prop="zrapidSpeed">
              <InputNumber
                style="text-align: left; width: 100%;"
                controls-position="right"
                v-model="form.zrapidSpeed"
              />
            </FormItem>
          </Col>
          <Col :span="12">
            <FormItem label="Z轴开始切削高度" prop="zstartCutHeight">
              <InputNumber
                style="text-align: left; width: 100%;"
                controls-position="right"
                v-model="form.zstartCutHeight"
              />
            </FormItem>
          </Col>
          <Col :span="12">
            <FormItem label="Z轴结束切削高度" prop="zendCutHeight">
              <InputNumber
                style="text-align: left; width: 100%;"
                controls-position="right"
                v-model="form.zendCutHeight"
              />
            </FormItem>
          </Col>

          <Col :span="12">
            <FormItem label="安全高度" prop="safeHeight">
              <InputNumber style="text-align: left; width: 100%;" controls-position="right" v-model="form.safeHeight" />
            </FormItem>
          </Col>
        </Row>
      </Form>
    </view>
    <template #footer>
      <view class="ko-cnc__footer" style="display:flex; align-items: center;justify-content: space-around;">
        <button class="ko-basic-button__card" @click="onSubmit">更新配置</button>
        <button class="ko-basic-button__card" @click="onPrintLabels">打印标签</button>
        <button
          class="ko-basic-button__card"
          :loading="gLoading"
          :disabled="gLoading"
          @click="onGenerate"
        >
          生成NC程序
        </button>
      </view>
    </template>
  </BasicPopup>
</template>

<style scoped lang="scss">
.ko-cnc {
  width: 900px;
  height: 76vh;
  padding: 10px;
  overflow-y: auto;

  &__footer {
    .ko-basic-button__card {
      width: 120px;
    }
  }


  /deep/ .el-input-number .el-input__inner {
    text-align: left;
  }
}
</style>
<!-- #endif -->
