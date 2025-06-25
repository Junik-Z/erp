<script>
import UniForms from "@/uni_modules/uni-forms/components/uni-forms/uni-forms.vue";
import UniFormsItem from "@/uni_modules/uni-forms/components/uni-forms-item/uni-forms-item.vue";
import UniEasyinput from "@/uni_modules/uni-easyinput/components/uni-easyinput/uni-easyinput.vue";
import { _deepCopy, _get, _isEmpty, _isEqual, CustomToast } from "@/utils";
import { sendInternalMessageApi } from "@/api/user";
import { getStaffListApi } from "@/api/erp/product";
import mixins from "@/mixins/mixins";
import BasicPopup from "@/components/BasicPopup/BasicPopup.vue";
import FilePicker from "@/components/FilePicker/FilePicker.vue";

let pType = "bottom";
let pPosition = "left";
let pAlign = "right";

// #ifdef H5
pType = "center";
pPosition = "top";
pAlign = "left";
// #endif


export default {
  name: "SendMsg",
  data() {
    return {
      visible: false,
      form: {
        staffIds: [],
        content: "",
        images: [],

        /* content: "消息内容",
        images: [
          "/files/down/png20250521/54921d03dd6847bfb07aeb0806cfd56f.png",
          "/files/down/png20250521/e5c79ee848d144049bc402f62dcb5ffe.png",
          "/files/down/png20250521/ffbb224353bd48cfbeb3852ce4ba0b6d.png",
          "/files/down/png20250521/0398b76d9466448aa02048032f4bcaab.png",
          "/files/down/png20250521/573515706c5f4810987efed5f9b66df3.png",
          "/files/down/png20250521/bf4b7bf91be447819b267ba4ad0ab4b2.png",
          "/files/down/png20250521/7595d9d3045f454383a2c3d3a31a007c.png",
          "/files/down/png20250521/95685fbb3b414654ab686a6476ce5991.png",
          "/files/down/png20250521/5cae72290f504edc824dd402a9f3d520.png",
        ],
        staffIds: [], */
      },

      loading: false,
      rules: {
        staffIds: {
          rules: [
            {
              format: "array",
            },
            {
              required: true,
              errorMessage: "请选择要发送的员工",
            },
          ],
          label: "员工",
          validateTrigger: "submit",
        },
        content: {
          rules: [
            {
              required: true,
              errorMessage: "输入消息内容",
            },
          ],
          label: "消息内容",
          validateTrigger: "submit",
        },
      },
      openResolve: null,

      placeholderLabel: "",

      list: [],
      noMore: false,
      sLoading: false,
      queryList: {
        pageSize: 20,
        pageNum: 0,
      },

      pType,
      pPosition,
      pAlign,
    };
  },
  props: {
    // 层级
    zIndex: {
      type: [String, Number],
      // #ifdef H5
      default: 997,
      // #endif
      // #ifndef H5
      default: 10075,
      // #endif
    },
  },
  mixins: [mixins],
  components: {
    FilePicker,
    BasicPopup,
    UniForms,
    UniFormsItem,
    UniEasyinput,
  },
  methods: {
    open(ids, label, noModal = false) {
      if (!this.isPerm("SEND_INTERNAL_MESSAGE")) return false;

      this.queryList = _deepCopy(this.$options.data().queryList);
      this.onSearchBar();
      if (noModal) {
        this.form = _deepCopy(this.$options.data().form);

        if (ids) {
          this.placeholderLabel = label;
          this.form.staffIds = ids;
        }

        this.visible = true;

        setTimeout(() => {
          this.$refs.FRef.setRules(this.rules);
        }, 100);
        return false;
      }

      return new Promise(resolve => {
        uni.showModal({
          title: "温馨提示",
          content: "您是否需要通知员工？",
          success: (resp) => {
            if (resp.confirm) {
              this.form = _deepCopy(this.$options.data().form);

              if (ids) {
                this.placeholderLabel = label;
                this.form.staffIds = ids;
              }

              this.visible = true;
              this.openResolve = resolve;
              setTimeout(() => {
                this.$refs.FRef.setRules(this.rules);
              }, 100);
            }

            if (resp.cancel) {
              resolve();
            }
          },
        });
      });
    },

    // 发送内部员工消息
    onSendInternal() {
      this.$refs.FRef.validate(async (valid) => {
        if (!valid) {
          const params = _deepCopy(this.form);
          params.images = (params.images || []).join(",");

          sendInternalMessageApi(params)
            .then(() => {
              this.visible = false;

              uni.$emit("$__update_msg_list__");

              CustomToast({
                title: "发送成功",
                success: () => {
                  this.openResolve?.();
                },
              });
            });

        } else {
          uni.showToast({
            title: _get(valid, "0.errorMessage") || "请检查表单项是否正确",
            icon: "none",
          });
        }
      });
    },

    // 关闭弹窗
    onClose() {
      this.openResolve?.();
    },

    // 获取员工列表
    getList(reset = false) {
      if (!this.isPerm("STAFF_LIST")) return false;

      if (reset) {
        this.list = [];
        this.queryList.pageNum = 0;
      }

      this.sLoading = true;

      getStaffListApi(this.queryList)
        .then(res => {
          const list = (res.data || []).map(item => ({
            ...item,
            value: item.id,
            label: item.name,
            logo: item.logo,
          }));

          this.list = this.onMergeArrays(this.list, list, "id");
          this.noMore = _isEmpty(list) || list.length < this.queryList.pageSize;
        })
        .catch(() => {
          this.noMore = true;
        })
        .finally(() => {
          this.sLoading = false;
        });
    },

    // 下一页
    onLower() {
      if (this.noMore) return false;
      this.queryList.pageNum += 1;
      this.getList(false);
    },
    // 索引搜索
    onSearchToNameIndex(key) {
      this.queryList.nameIndex = key;
      this.getList(true);
    },

    // 勾选用户
    onSelect(item) {
      if (this.form.staffIds.some(v => _isEqual(v, item.value))) {
        this.form.staffIds = this.form.staffIds.filter(id => !_isEqual(id, item.value));
      } else {
        this.form.staffIds.push(item.value);
      }
    },

    // 取消
    onCancel() {
      setTimeout(() => {
        this.$nextTick(() => {
          this.getList(true);
        });
      });
    },

    // input 搜索
    onSearchBar() {
      this.$refs.ILRef && (this.$refs.ILRef.touchmoveIndex = -1);
      this.getList(true);
    },
  },
  mounted() {
  },
};
</script>

<template>
  <BasicPopup
    @close="onClose"
    :visible.sync="visible"
    title="发送系统消息"
    :type="pType"
    :z-index="zIndex"
    no-safe-bottom
  >
    <view class="ko-send__popup">
      <UniForms
        ref="FRef"
        :model="form"
        label-width="90px"
        :label-align="pAlign"
        :rules="rules"
        :label-position="pPosition"
      >
        <view class="ko-send__wrap">
          <view class="ko-send__left">
            <UniFormsItem label-width="0" name="staffIds" v-if="isPerm('STAFF_LIST')">
              <view style="width: 100%;">
                <view style="width: 100%">
                  <uni-search-bar
                    v-model="queryList.name"
                    placeholder="请输入"
                    @confirm="onSearchBar"
                    @cancel="onCancel"
                    clear-button="none"
                  />
                </view>
                <view class="ko-send__staff">
                  <IndexList
                    ref="ILRef"
                    :value="form.staffIds"
                    v-if="visible"
                    :data="list"
                    :loading="sLoading"
                    @lower="onLower"
                    :no-more="noMore"
                    @search="onSearchToNameIndex"
                    is-checked
                    is-send-msg
                    is-staff
                    @click="onSelect"
                  />
                </view>
              </view>
            </UniFormsItem>
            <view
              v-if="!isPerm('STAFF_LIST')"
              style="font-size: 10px;color: #e43d33; margin-top: 5px; text-align: center;margin-bottom: 16px;"
            >
              您没有获取员工列表权限，请联系管理员授权。
            </view>
          </view>

          <view class="ko-send__right">
            <view v-if="form.staffIds.length"
                  style="font-size: 12px; color: #8f939c; padding-left: 10px; margin-bottom: 10px;">
              已选 {{ form.staffIds.length }} 位员工
            </view>
            <UniFormsItem :label-align="pAlign" label="消息内容：" name="content" required>
              <UniEasyinput
                v-model="form.content"
                placeholder="请输入消息内容"
                type="textarea"
                maxlength="100"
              />
            </UniFormsItem>

            <UniFormsItem :label-align="pAlign" label="图片：" name="content">
              <FilePicker
                v-model="form.images"
                :image-styles="{border: {radius: '6px'}, width: 100, height: 100}"
                :limit="9"
                file-extname="png,jpg,jpeg,gif"
                show-update-list
                return-type="array"
              />
            </UniFormsItem>

          </view>
        </view>
      </UniForms>
    </view>
    <template #footer>
      <view class="ko-send__popup--footer">
        <button
          class="ko-basic-button__card"
          @click="onSendInternal"
          :loading="loading"
          :disabled="loading"
        >
          发送
        </button>
      </view>
    </template>
  </BasicPopup>
</template>

<style scoped lang="scss">
.ko-send {
  &__popup {
    padding: 10px 10px 0 0;

    &--footer {
      display: flex;
      align-items: center;
      justify-content: center;

      .ko-basic-button__card {
        width: 120px;
      }
    }
  }

  // #ifdef MP
  &__popup {
    width: 100vw;
    height: 70vh;
    overflow-y: auto;
  }

  &__staff {
    width: 100%;
    height: 68vh;
    position: relative;
  }

  &__right {
    padding-left: 10px;
  }

  // #endif

  // #ifndef MP
  &__staff {
    width: 100%;
    height: 50vh;
    position: relative;
  }

  &__wrap {
    display: flex;
  }

  &__left {
    width: 40%;

    ::v-deep .uni-forms-item__label {
      display: none;
    }
  }

  &__right {
    padding-left: 10px;
    flex: 1;
  }

  // #endif
}

// #ifdef H5
::v-deep .ko-basic-popup {
  max-width: 1000px;
  width: 1000px;

  .uni-forms-item__content {
    width: 100%;
  }
}

// #endif
</style>
