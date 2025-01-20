<script>
import TopMenus from "@/produce/components/TopMenus.vue";
import { TabList } from "./define";
import UvAvatar from "@/uni_modules/uv-avatar/components/uv-avatar/uv-avatar.vue";
import { _deepCopy, _get, _isEmpty, _isEqual, _xor } from "@/utils";
import mixins from "@/mixins/mixins";
import IndexList from "@/components/IndexList/IndexList.vue";
import UvActionSheet from "@/uni_modules/uv-action-sheet/components/uv-action-sheet/uv-action-sheet.vue";
import PickerUser from "@/components/PickerUser/PickerUser.vue";
import KoMovable from "@/components/Movable/index.vue";
import { bindStaffApi, getStaffInfoApi, getStaffListApi, removeStaffApi, unbindStaffApi } from "@/api/erp/product";
import { PageEnums } from "@/utils/config";

export default {
  name: "Staff",
  components: {KoMovable, PickerUser, UvActionSheet, IndexList, TopMenus},
  mixins: [mixins],
  data() {
    const _this = this;
    return {
      TabList,

      content: [
        {
          text: "新增",
          iconPath: "/static/images/icons/added.png",
          path: "/erp/sale/client",
        },
      ],

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
          label: "员工Logo",
          prop: "logo",
          width: 100,
          render: (h, {row}) => {
            return h(
              "div",
              {style: {display: "flex", justifyContent: "center", alignItems: "center"}},
              [h(UvAvatar, {
                props: {
                  src: _this.getImageUrl(_get(row, "logo")),
                  size: 64,
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
          label: "联系电话",
          prop: "phone",
        },
        {
          label: "地址",
          prop: "address",
        },
        {
          label: "发票抬头",
          prop: "invoiceTitle",
        },
        {
          label: "纳税人识别号",
          prop: "taxNumber",
        },
        {
          label: "开票类型",
          prop: "invoiceType",
        },
        {
          label: "税率",
          prop: "taxRate",
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
    onUnbind(user) {
      uni.showModal({
        title: "温馨提示",
        content: `您确定要解绑员工吗？`,
        success: (res) => {
          if (res.confirm) {
            Promise.all(
              user.map(userId => unbindStaffApi({
                staffId: this.node.id,
                userId,
              })),
            )
              .then(() => {
                uni.showToast({
                  title: "解绑成功",
                });
                const use = _deepCopy(this.list[this.nodeIndex].users)?.filter(v => {
                  return !user.includes(v.userId);
                });
                this.$set(this.list[this.nodeIndex], "users", use);
              });
          }
        },
      });
    },

    // 绑定
    onBind(user = []) {
      Promise.all(
        user.map(userId => bindStaffApi({
          staffId: this.node.id,
          userId,
        })),
      )
        .then(() => {
          uni.showToast({
            title: "绑定成功",
          });
          this.$set(this.list[this.nodeIndex], "users", [
            ...this.list[this.nodeIndex]?.users || [],
            ...user.map(userId => ({userId})),
          ]);
        });
    },

    onBindPopup(item, isBind, index) {
      this.bindUserList = _deepCopy(item)?.users?.map(v => v.userId) || [];
      this.isBind = isBind;
      this.node = item;
      this.nodeIndex = index;
      this.visible = true;
    },

    onConfirm(checked) {
      const users = _xor(this.bindUserList, checked);
      !_isEmpty(users) && this[this.isBind ? "onBind" : "onUnbind"](users);
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
      this.noRefresh = true;
      uni.navigateTo({
        url: PageEnums.produceStaffCompleteProcess + `?id=${item.id}`,
      });
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
        },
        {
          name: "删除",
          color: "#e43d33",
          func: "onRemove",
        },
      ];
    },
  },
};
</script>

<template>
  <view class="ko-staff">
    <TopMenus :tabs="TabList" :path="PageEnums.produceStaff" v-if="!isNotMenu" />

    <view class="ko-staff__content">
      <!-- #ifdef MP -->
      <view class="ko-client__wrap">
        <IndexList
          :data="list"
          :loading="loading"
          @click="onJumpInfo"
          button-perm="Produce_Write"
          @lower="onLower"
          :no-more="noMore"
          @search="onSearchToNameIndex"
          is-staff
        >
          <template #default="{node, index}">
            <view style="display: flex; align-items: center; justify-content: flex-end; margin-top: 4px">
              <button @click.stop="onBindPopup(node, true, index)" class="ko-basic-button__user">绑定员工</button>
              <button @click.stop="onBindPopup(node, false, index)" class="ko-basic-button__user">解绑员工</button>
              <button
                class="ko-basic-button__user"
                @click.stop="onActionClick(node, index)"
              >
                更多
              </button>
            </view>
          </template>
        </IndexList>
      </view>
      <!-- #endif -->

      <!-- #ifdef H5 -->
      <view style="padding: 10px;">
        <KoTable
          :loading="loading"
          :columns="getColumns"
          :data="list"
          empty-text="暂无数据"
          stripe
          @row-click="onJumpInfo($event)"
        >
          <template #operate="{item, index}" v-if="isPerm('Produce_Write')">
            <view style="display: flex; align-items: center; justify-content: center;">
              <button @click.stop="onBindPopup(item, true, index)" class="ko-basic-button__user">绑定员工</button>
              <button @click.stop="onBindPopup(item, false, index)" class="ko-basic-button__user">解绑员工</button>
              <button class="ko-basic-button__user" @click.stop="onJump(item, index)">编辑</button>
              <button class="ko-basic-button__user" @click.stop="onRemove(item, index)">删除</button>
            </view>
          </template>
        </KoTable>
      </view>
      <!-- #endif -->
    </view>

    <PickerUser
      v-if="isPerm('Produce_Write')"
      :visible.sync="visible"
      :title="isBind ? '选择绑定员工' : '解绑员工'"
      is-confirm
      :value="bindUserList"
      :disabled="isBind ? bindUserList : []"
      :checked-list="isBind ? [] : bindUserList"
      :multiple="false"
      @confirm="onConfirm"
    />

    <KoMovable
      v-if="isPerm('Produce_Write')"
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
  display: flex;
  flex-direction: column;
  height: 100vh;

  &__content {
    flex: 1;
    position: relative;
  }

  &__wrap {
    height: 100%;
  }

}
</style>
