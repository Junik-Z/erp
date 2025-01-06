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
import { bindStaffApi, getStaffListApi, removeStaffApi, unbindStaffApi } from "@/api/erp/product";
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
      item: {},

      noMore: false,
      queryList: {
        pageSize: 20,
        pageNum: 0,
      },

      actionItem: {},

      tab: 0,

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
  methods: {
    getList(reset) {

      if (reset) {
        this.queryList.pageNum = 0;
        this.list = [];
      }

      this.loading = true;

      getStaffListApi({...this.queryList})
        .then((res) => {
          const list = (res.data || []).map(item => ({
            ...item,
            value: item.id,
            label: item.name,
            logo: item.logo,
          }));
          this.list = this.onMergeArrays(this.list, list, "id");
          this.noMore = _isEmpty(res.data) || res.data.length < this.queryList.pageSize;
        })
        .finally(() => {
          this.loading = false;
        });
    },

    onJump(row) {
      uni.navigateTo({url: `${PageEnums.produceNewStaff}?id=${row.id}`});
    },

    onRemove(row) {
      const node = _deepCopy(row);
      uni.showModal({
        title: "温馨提示",
        content: `您确定要删除 ${row.name} 员工吗？`,
        success: (res) => {
          if (res.confirm) {
            removeStaffApi(node)
              .then(() => {
                uni.showToast({title: "删除成功"});
                this.getList(true);
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
                staffId: this.item.id,
                userId,
              })),
            )
              .then(() => {
                uni.showToast({
                  title: "解绑成功",
                });
                this.getList(true);
              });
          }
        },
      });
    },

    // 绑定
    onBind(user = []) {
      Promise.all(
        user.map(userId => bindStaffApi({
          staffId: this.item.id,
          userId,
        })),
      )
        .then(() => {
          uni.showToast({
            title: "绑定成功",
          });
          this.getList(true);
        });
    },

    onBindPopup(item, isBind) {
      this.bindUserList = _deepCopy(item)?.users?.map(v => v.userId) || [];
      this.isBind = isBind;
      this.item = item;
      this.visible = true;
    },

    onConfirm(checked) {
      const users = _xor(this.bindUserList, checked);
      !_isEmpty(users) && this[this.isBind ? "onBind" : "onUnbind"](users);
      this.visible = false;
    },

    onTrigger(event) {
      if ("uni") {
        uni.navigateTo({url: PageEnums.produceNewStaff});
        return false;
      }
      const {path} = event.item || {};
      if (path) {
        uni.navigateTo({url: path});
      }
    },

    onJumpInfo(item) {
      uni.navigateTo({
        url: "/erp/finance/check" + `?id=${item.id}&customer_type=staff`,
      });
    },

    onActionClick(item) {
      this.actionItem = item;
      this.$refs.UASRef.open();
    },
    // 处理调用底部弹出的按钮
    onSelect(item) {
      if (item.openType) return false;
      this[item.func](_deepCopy(this.actionItem), ...(item.arg || []));
    },

    onLower() {
      if (this.noMore) return false;
      this.queryList.pageNum += 1;
      this.getList();
    },

    // 根据索引搜索
    onSearchToNameIndex(key) {
      this.queryList.nameIndex = key;
      this.getList(true);
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
    <TopMenus :tabs="TabList" :current="1" />

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
        >
          <template #default="{node}">
            <view style="display: flex; align-items: center; justify-content: flex-end; margin-top: 4px">
              <button @click.stop="onBindPopup(node, true)" class="ko-basic-button__user">绑定员工</button>
              <button @click.stop="onBindPopup(node, false)" class="ko-basic-button__user">解绑员工</button>
              <button
                class="ko-basic-button__user"
                @click.stop="onActionClick(node)"
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
          <template #operate="{item}" v-if="isPerm('Produce_Write')">
            <view style="display: flex; align-items: center; justify-content: center;">
              <button @click.stop="onBindPopup(item, true)" class="ko-basic-button__user">绑定员工</button>
              <button @click.stop="onBindPopup(item, false)" class="ko-basic-button__user">解绑员工</button>
              <button class="ko-basic-button__user" @click.stop="onJump(item)">编辑</button>
              <button class="ko-basic-button__user" @click.stop="onRemove(item)">删除</button>
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
