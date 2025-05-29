<script>
import TopMenus from "./components/TopMenus.vue";
import { TabList } from "./define";
import UvAvatar from "@/uni_modules/uv-avatar/components/uv-avatar/uv-avatar.vue";
import { _deepCopy, _get, _isEmpty, _isEqual } from "@/utils";
import mixins from "@/mixins/mixins";
import IndexList from "@/components/IndexList/IndexList.vue";
import UvActionSheet from "@/uni_modules/uv-action-sheet/components/uv-action-sheet/uv-action-sheet.vue";
import PickerUser from "@/components/PickerUser/PickerUser.vue";
import KoMovable from "@/components/Movable/index.vue";
import { bindStaffApi, getStaffInfoApi, getStaffListApi, removeStaffApi, unbindStaffApi } from "@/api/erp/product";
import { PageEnums } from "@/utils/config";
import BindUserQrcode from "@/components/BindUserQrcode.vue";

export default {
  name: "Staff",
  components: {BindUserQrcode, KoMovable, PickerUser, UvActionSheet, IndexList, TopMenus},
  mixins: [mixins],
  data() {
    const _this = this;
    return {
      TabList,

      list: [],
      loading: false,
      visible: false,

      bindUserList: [],
      isBind: false,

      noMore: false,
      queryList: {
        pageSize: 20,
        pageNum: 0,
      },

      tab: 0,

      noRefresh: false,

      node: {},
      nodeIndex: null,

      isNotMenu: false,

      // #ifdef H5
      columns: [
        {
          label: "序号",
          type: "index",
          width: 80,
        },
        {
          label: "Logo",
          prop: "logo",
          width: 100,
          render: (h, {row}) => {
            return h(
              "div",
              {style: {display: "flex", justifyContent: "center", alignItems: "center"}},
              [h(UvAvatar, {
                props: {
                  src: _this.getImageUrl(_get(row, "logo")),
                  size: 42,
                  text: _get(row, "name") || _this.GET_SHOP_NAME,
                },
              })],
            );
          },
        },
        {
          label: "昵称",
          prop: "name",
        },
        {
          label: "金额",
          prop: "amount",
          width: 100,
          render: (h, {row}) => {
            return h(
              "span",
              {style: {display: "flex", justifyContent: "center", alignItems: "center"}},
              [_this.toYuan(Math.abs(row.amount || 0))],
            );
          },
        },
        {
          label: "绑定用户",
          prop: "name",
          render: (h, {row}) => {
            return h(
              "div",
              {style: {display: "flex", justifyContent: "center", alignItems: "center"}},
              [h(UvAvatar, {
                props: {
                  src: _this.getImageUrl(_get(row, "users.0.avatar")),
                  size: 42,
                  text: _get(row, "users.0.nickName"),
                },
              })],
            );
          },
        },
        // {
        //   label: "联系电话",
        //   prop: "phone",
        // },
        {
          label: "地址",
          prop: "address",
        },
        {
          label: "开户行",
          prop: "bank",
        },
        {
          label: "银行账号",
          prop: "bankAccount",
        },
        {
          label: "备注",
          prop: "remark",
        },
        {
          label: "操作",
          width: 360,
          slot: "operate",
        },
      ],
      // #endif
    };
  },
  onShow() {
    this.getList(true);
  },
  onLoad(option) {
    this.isNotMenu = option.isNotMenu === "true";
  },
  methods: {
    getListNode(item) {
      return {
        ...item,
        _no_bind_: _isEmpty(item.users),
        value: item.id,
        label: item.name,
        logo: item.logo,
      };
    },

    getList(reset) {
      if (reset && !this.noRefresh) {
        this.queryList.pageNum = 0;
        this.list = [];
      }

      const info = uni.getStorageSync("TENP_ORDER_INFO");

      if (this.noRefresh && info && this.list.length) {
        this.updateList();
        return false;
      }

      this.loading = true;

      getStaffListApi({...this.queryList})
        .then((res) => {
          const list = (res.data || []).map(this.getListNode);
          this.list = this.onMergeArrays(this.list, list, "id");
          this.noMore = _isEmpty(res.data) || res.data.length < this.queryList.pageSize;
        })
        .finally(() => {
          this.loading = false;
          this.noRefresh = false;

          uni.setStorageSync("TENP_ORDER_INFO", null);
        });
    },

    onJump(row) {
      this.noRefresh = true;
      uni.navigateTo({url: `${PageEnums.produceNewStaff}?id=${row.id}`});
    },

    onRemove(row, index) {
      const node = _deepCopy(row);
      uni.showModal({
        title: "温馨提示",
        content: `您确定要删除 ${row.name} 员工吗？`,
        success: (res) => {
          if (res.confirm) {
            removeStaffApi(node)
              .then(() => {
                uni.showToast({title: "删除成功"});
                // this.getList(true);
                this.list.splice(index, 1);
              });
          }
        },
      });
    },

    // 解绑
    onUnbind(userId) {
      uni.showModal({
        title: "温馨提示",
        content: `您确定要解绑员工吗？`,
        success: (res) => {
          if (res.confirm) {
            unbindStaffApi({
              staffId: this.node.id,
              userId,
            })
              .then(() => {
                uni.showToast({title: "解绑成功"});
                this.$set(this.list[this.nodeIndex], "users", null);
                this.$set(this.list[this.nodeIndex], "_no_bind_", true);
              });
          }
        },
      });
    },

    // 绑定
    onBind(userId) {
      bindStaffApi({
        staffId: this.node.id,
        userId,
      })
        .then(() => {
          uni.showToast({title: "绑定成功"});
          this.$set(this.list[this.nodeIndex], "users", [this.$refs.PURef.getUserInfo(userId)]);
          this.$set(this.list[this.nodeIndex], "_no_bind_", false);
        });
    },

    onBindPopup(item, isBind, index) {
      this.isBind = isBind;
      this.node = item;
      this.nodeIndex = index;

      this.$refs.PURef?.open?.({staffId: item.value});
    },

    onConfirm(checked) {
      !_isEmpty(checked) && this[this.isBind ? "onBind" : "onUnbind"](checked[0]);
      this.visible = false;
    },

    onTrigger(event) {
      if ("uni") {
        this.noRefresh = true;
        uni.navigateTo({url: PageEnums.produceNewStaff});
        return false;
      }
      const {path} = event.item || {};
      if (path) {
        uni.navigateTo({url: path});
      }
    },

    onJumpInfo(item) {
      if (this.isPerm("STAFF_SALARY_LIST")) {
        this.noRefresh = true;
        uni.navigateTo({
          url: PageEnums.staffWages + `?id=${item.id}&no-operate=true&name=${item.name}`,
        });
      }
    },

    onActionClick(item, index) {
      this.node = item;
      this.nodeIndex = index;
      this.$refs.UASRef.open();
    },
    // 处理调用底部弹出的按钮
    onSelect(item) {
      if (item.openType) return false;
      this[item.func](_deepCopy(this.node), this.nodeIndex);
    },

    onLower() {
      this.noRefresh = false;
      if (this.noMore) return false;
      this.queryList.pageNum += 1;
      this.getList();
    },

    // 根据索引搜索
    onSearchToNameIndex(key) {
      this.noRefresh = false;
      this.queryList.nameIndex = key;
      this.getList(true);
    },

    // 更新列表数据
    updateList() {
      const info = uni.getStorageSync("TENP_ORDER_INFO");
      const id = info ? (_isString(info) ? info : info.id) : this.node.id;

      getStaffInfoApi({id})
        .then(res => {
          const data = res.data || {};
          const index = this.list.findIndex(v => v.id === data.id);
          const node = this.node || {};

          const item = this.getListNode(data);

          if (index > -1) {
            this.$set(this.list, index, {...node, ...item});
          } else {
            this.list.unshift({...node, ...item});
          }
        })
        .finally(() => {
          this.noRefresh = false;
          uni.setStorageSync("TENP_ORDER_INFO", null);
        });
    },

    // 处理索引点击按钮
    onClickEvent({button, item, $index}) {
      if (_isEqual(button.value, "bind")) {
        this.onBindPopup(item, button.isBind, $index);
      }

      if (_isEqual(button.value, "qrcode")) {
        this.$refs.BUQRef.open(item, "staff");
      }
    },

    // 判断是否显示索引列表内的按钮
    setShowEventButtonFunc(obj) {
      if (_isEqual(obj.button.value, "qrcode")) return true;
      if (obj.button.isBind) {
        return obj.item._no_bind_;
      } else {
        return !obj.item._no_bind_;
      }
    },
  },

  computed: {
    // #ifdef H5
    getColumns() {
      return this.columns.filter(item => this.isHistory ? !_isEqual(item.label, "操作") : true);
    },
    // #endif

    actionList() {
      return [
        {
          name: "编辑",
          func: "onJump",
          perm: "STAFF_EDIT",
        },
        {
          name: "删除",
          color: "#e43d33",
          func: "onRemove",
          perm: "STAFF_DELETE",
        },
      ].filter(item => this.isPerm(item.perm));
    },

    // #ifdef MP
    getIndexEventList() {
      return [
        {label: "二维码", value: "qrcode", perm: "STAFF_UNBIND"},
        {label: "绑定员工", isBind: true, perm: "STAFF_BIND", value: "bind"},
        {label: "解绑员工", isBind: false, perm: "STAFF_UNBIND", value: "bind"},
      ].filter(item => {
        if (item.perm) return this.isPerm(item.perm);
        return true;
      });
    },

    // #endif
  },
};
</script>

<template>
  <view class="ko-staff">
    <!-- #ifdef MP -->
    <Notice />
    <!-- #endif -->
    <TopMenus :tabs="TabList" :path="PageEnums.produceStaff" v-if="!isNotMenu" />

    <view class="ko-staff__content">
      <!-- #ifdef MP -->
      <view class="ko-client__wrap">
        <IndexList
          :data="list"
          :loading="loading"
          @click="onJumpInfo"
          @lower="onLower"
          :no-more="noMore"
          @search="onSearchToNameIndex"
          is-staff

          :show-more-button="!!actionList.length"
          @click-more="onActionClick"

          :events="getIndexEventList"
          @click-event="onClickEvent"
          :show-event-button-func="setShowEventButtonFunc"
        />
      </view>
      <!-- #endif -->

      <!-- #ifdef H5 -->
      <view style="padding: 10px; height: calc(100vh - 114px)">
        <KoTable
          :loading="loading"
          :columns="getColumns"
          :data="list"
          empty-text="暂无数据"
          stripe
          @row-click="onJumpInfo($event)"

          @next-load="onLower"
          :no-more="noMore || loading"

          :no-refresh="noRefresh"
        >
          <template #operate="{item, index}">
            <view style="display: flex; align-items: center; justify-content: center;">
              <button
                v-if="item._no_bind_ && isPerm('STAFF_BIND')"
                @click.stop="onBindPopup(item, true, index)"
                class="ko-basic-button__user"
              >
                绑定员工
              </button>
              <button
                v-if="!item._no_bind_ && isPerm('STAFF_UNBIND')"
                @click.stop="onBindPopup(item, false, index)"
                class="ko-basic-button__user"
              >
                解绑员工
              </button>
              <button
                class="ko-basic-button__user"
                @click.stop="onJump(item, index)"
                v-if="isPerm('STAFF_EDIT')"
              >
                编辑
              </button>
              <button
                class="ko-basic-button__user"
                @click.stop="onRemove(item, index)"
                v-if="isPerm('STAFF_DELETE')"
              >
                删除
              </button>
            </view>
          </template>
        </KoTable>
      </view>
      <!-- #endif -->
    </view>

    <PickerUser
      :visible.sync="visible"
      :title="isBind ? '选择绑定员工' : '解绑员工'"
      is-confirm
      :multiple="false"
      @confirm="onConfirm"
      ref="PURef"
      type="staffUserList"

      is-external-open
      not-created-request
      :is-selected="!isBind"
      :is-not-selected="isBind"
    />

    <BindUserQrcode ref="BUQRef" />

    <KoMovable
      v-if="isPerm('STAFF_ADD')"
      @click="onTrigger('')"
    />
    <!-- #ifdef MP -->
    <UvActionSheet
      ref="UASRef"
      :actions="actionList"
      safe-area-inset-bottom
      round="10"
      cancel-text="取消"
      @select="onSelect"
    />
    <!-- #endif -->
  </view>
</template>

<style scoped lang="scss">
.ko-staff {
  padding-top: 10px;

  display: flex;
  flex-direction: column;
  // #ifdef MP
  height: 100vh;
  // #endif

  &__content {
    flex: 1;
    position: relative;
  }

  &__wrap {
    height: 100%;
  }

}
</style>
