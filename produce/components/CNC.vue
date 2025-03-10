<!-- #ifdef H5 -->
<script>
import {
  generateCNCProperties,
  getCNCProperties,
  getNCProgramsApi,
  getProduceDetailApi,
  removeNCProgramsApi,
  updateCNCProperties,
} from "@/api/erp/produce";
import {
  Col,
  Form,
  FormItem,
  Input,
  InputNumber,
  Loading,
  Row,
  TabPane,
  Tabs,
} from "@/uni_modules/element-ui/element.min";
import { _deepCopy, _get, _isEmpty, _isEqual, _omit, _toFinite, CustomToast } from "@/utils";
import { CncCalculate } from "./cncCalculate";
import mixins from "@/mixins/mixins";

export default {
  name: "CNC",
  mixins: [mixins],
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

      NCList: [],
      editableTabsValue: null,
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
    Row,
    Col,
    Tabs,
    TabPane,
  },
  created() {
    this.CNC = new CncCalculate({});
  },
  methods: {
    open(node) {
      this.node = node;
      this.getAllNCPrograms();
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
            .then(() => {
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

          /* this.$refs.TRef.innerHTML = boards.map(v => v.svgContent).join("<br/>");
          this.gLoading = false;
          if ("true") return false; */

          generateCNCProperties({boards, propertiesId: this.editableTabsValue})
            .then((blob) => {
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

    // 获取所有NC设备
    getAllNCPrograms() {
      getNCProgramsApi({pageNum: 0, pageSize: 100})
        .then(res => {
          this.NCList = res.data.map(v => ({...v, __id__: v.id}));
          this.editableTabsValue = this.NCList[0].__id__;
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

    // 处理添加
    onAddedTabs(targetName, action) {
      if (_isEqual(action, "add")) {
        const nextId = `${Math.max(...this.NCList.map(v => _toFinite(v.__id__))) + 1}`;
        const F = {..._omit(_deepCopy(this.form), ["id", "__id__"]), __id__: nextId};
        this.NCList.push(_deepCopy(F));
        this.editableTabsValue = nextId;
        this.form = _deepCopy(F);
      }


      if (_isEqual(action, "remove")) {

        const index = this.getNCPIndex(targetName);
        const id = this.NCList[index].id;

        if (id == 1) {
          CustomToast({
            title: "默认配置不能删除",
            icon: "none",
          });
          return false;
        }

        uni.showModal({
          title: "温馨提示",
          content: "您确定要删除该程序配置吗？",
          success: (res) => {
            if (res.confirm) {
              const index = this.getNCPIndex(targetName);
              const id = this.NCList[index].id;
              if (id) {
                removeNCProgramsApi({id})
                  .then(() => {
                    CustomToast({
                      title: "删除成功",
                    });
                    this.getAllNCPrograms();
                  });
              } else {
                this.NCList.splice(index, 1);
                this.editableTabsValue = this.NCList.at(-1).__id__;
              }
            }
          },
        });
      }
    },

    // 根据ID获取NC列表的下标
    getNCPIndex(id) {
      return this.NCList.findIndex(v => v.__id__ === id);
    },

    // 处理点击tab
    onTabClick(tab) {
      const index = this.getNCPIndex(tab.name);
      this.form = _deepCopy(this.NCList[index]);
    },
  },
};
</script>

<template>
  <BasicPopup :visible.sync="visible" title="NC配置">
    <view class="ko-cnc">
      <div ref="TRef" v-if="false" style="width: 100%; overflow: auto"></div>
      <Tabs
        type="card"
        :editable="isPerm('CNC_DELETE_PROGRAM')"
        @edit="onAddedTabs"
        v-model="editableTabsValue"
        @tab-click="onTabClick"
      >
        <TabPane
          v-for="(item, index) of NCList"
          :name="item.__id__"
          :key="item.__id__"
          :label="`${index + 1}`"
          :class="{'is-root': item.id == 1}"
        />
      </Tabs>

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
        <button class="ko-basic-button__card" @click="onSubmit" v-if="isPerm('CNC_UPDATE_PROPERTIES')">更新配置</button>
        <button class="ko-basic-button__card" @click="onPrintLabels">打印标签</button>
        <button
          class="ko-basic-button__card"
          :loading="gLoading"
          :disabled="gLoading"
          @click="onGenerate"
          v-if="isPerm('CNC_GENERATE_PROGRAM')"
        >
          生成NC程序
        </button>
      </view>
    </template>
  </BasicPopup>
</template>

<style lang="scss">
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
