<script>
import { MENU_LIST, PageEnums, ROLE_LIST_ENUMS } from "@/utils/config";
import mixins from "@/mixins/mixins";
import BasicCard from "@/components/BasicCard/BasicCard.vue";
import UvAvatarGroup from "@/uni_modules/uv-avatar/components/uv-avatar-group/uv-avatar-group.vue";
import { getPermissionsApi, removeRoleApi, setRoleApi } from "@/api/admin";
import BasicPopup from "@/components/BasicPopup/BasicPopup.vue";
import UvAvatar from "@/uni_modules/uv-avatar/components/uv-avatar/uv-avatar.vue";
import { _deepCopy, _get, _isEqual } from "@/utils";
import PickerUser from "@/components/PickerUser/PickerUser.vue";
import KoMovable from "@/components/Movable/index.vue";
import Billing from "./../components/billing/billing.vue";

export default {
  name: "SetRole",
  components: {KoMovable, PickerUser, UvAvatar, BasicPopup, UvAvatarGroup, BasicCard, Billing},
  mixins: [mixins],
  data() {
    return {
      MenuList: MENU_LIST,
      urls: [],
      visible: false,
      role: "",
      backup: [],

      premList: {},

      avatarGroupSize: 40,

      // 是否开启定制权限
      isCustom: false,
    };
  },
  onShow() {
    this.getList();
  },
  methods: {
    getList() {
      this.loading = true;
      getPermissionsApi()
        .then(res => {
          console.log(res.data);
          this.premList = _deepCopy(res.data) || [];
        })
        .finally(() => {
          this.loading = false;
        });
    },

    // 开启设置用户权限
    onSetRole(type, item) {
      this.role = (item?.role || []).find(v => v.indexOf(type) > -1);

      this.$refs.PickerUserRef.open({role: this.role});

      /* getRolePermUsersApi({role: this.role})
        .then(res => {
          console.log(res);
        }); */

      // this.backup = _deepCopy(_get(this.premList, this.role))?.map(v => v.userId) || [];
    },

    // 跳转到会员管理
    onJumpMember(type, item) {
      const role = (item.role || []).find(v => v.indexOf(type) > -1);

      const url = {
        Sales_Member: PageEnums.saleClient,
        Purchase_Member: PageEnums.purchaseClient,
        Delivery_Member: PageEnums.logisticsClient,
      }[role];

      url && uni.navigateTo({url});
    },

    // 确认设置权限
    onConfirm(checked) {
      const {remove, add} = checked || {};

      const Func = [];

      if (remove && remove.length) {
        Func.push(removeRoleApi({userIds: remove, role: this.role}));
      }

      if (add && add.length) {
        Func.push(setRoleApi({userIds: add, role: this.role}));
      }

      if (Func.length) {
        Promise.all(Func)
          .then(() => {
            uni.showToast({title: "操作成功"});
            this.getList();
          })
          .finally(() => {
            this.visible = false;
          });
      } else {
        this.visible = false;
      }

      /*  if ("not") return false;

       const users = _xor(this.backup, checked);

       if (_isEmpty(users)) {
         this.visible = false;
         return false;
       }

       const cUsers = users?.map(id => {
         const node = this.$refs.PickerUserRef.getUserInfo(id);

         if (node?.role?.indexOf?.(this.role) > -1) {
           node.role = node.role?.filter(v => !_isEqual(v, this.role));
         } else {
           node?.role?.push?.(this.role);
         }

         return !_isEmpty(node) && setUserRoleApi(node);
       });

       Promise.all(cUsers)
         .then(() => {
           uni.showToast({title: "设置成功"});
           this.$refs.PickerUserRef.getList(true);
           this.getList();
         })
         .finally(() => {
           this.visible = false;
         }); */
    },

    // 前往菜单详情设置
    onToAuth(type, item) {
      const role = (item?.role || []).find(v => v.indexOf(type) > -1);
      role && uni.navigateTo({url: `${PageEnums.adminAuthorization}?model_key=${item.modelKey}&role=${role}`});
    },

    // 开启取消定制
    onTrigger() {
      this.isCustom = !this.isCustom;
    },

    // 跳转到自定义权限页面
    onJumpCustom(type, item, custom) {
      if (item.role.includes("CNC_MEMBER")) {
        this.onCncEnable(type, item, custom);
      } else {
        const role = (item?.role || []).find(v => v.indexOf(type) > -1);
        role && uni.navigateTo({url: `${PageEnums.adminAuthorization}?model_key=${item.modelKey}&role=${role}&isCustom=true`});
      }
    },

    // 判断cnc权限
    onCncEnable(type, item, custom) {
      // 是否有CNC权限
      if (this.GET_CONFIG_INFO?.cncEnable) {
        if (_isEqual(custom, "custom")) {
          uni.navigateTo({url: `${PageEnums.adminAuthorization}?model_key=cnc&role=CNC_MEMBER&isCustom=true`});
        } else {
          const Func = {role: "onSetRole", more: "onToAuth"}[custom];
          Func && this[Func](type, item);
        }
      } else {
        this.$refs.BRef.open();
      }
    },
  },
  computed: {
    getMenuList() {
      return this.MenuList.filter(item => item.isUpRole);
    },

    getTitle() {
      return (ROLE_LIST_ENUMS[this.role] || "") + "权限设置";
    },

    getAvatarList() {
      return (type, item) => {
        const role = (item?.role || []).find(v => v.indexOf(type) > -1);
        if (role) return (_get(this.premList || {}, role) || []).map(v => this.getImageUrl(v.avatar));
        return [];
      };
    },

    getNameList() {
      return (type, item) => {
        const role = (item?.role || []).find(v => v.indexOf(type) > -1);
        return role ? (_get(this.premList || {}, role) || []).map(v => v.nickName) : [];
      };
    },
  },
};
</script>

<template>
  <view class="ko-role ko-basic-added-form" :style="[{'--ko-avatar-group-size': avatarGroupSize + 'px'}]">

    <BasicCard :spacing="10" v-for="(item, index) of getMenuList" :key="index">
      <view class="ko-role__item">
        <button class="ko-basic-button__card ko-role__custom" @click="onJumpCustom('WRITE', item, 'custom')">定制我的
        </button>

        <uni-section :title="item.label">
          <template #decoration>
            <view class="ko-role__item--center--icon" style="margin-right: 10px;">
              <i class="iconfont" :class="[item.icon]"></i>
            </view>
          </template>
        </uni-section>

        <view class="ko-role__item--user">
          <block v-if="!isCustom">
            <view class="ko-role__item--read" v-if="item.noShowInHome && item.role.includes('CNC_MEMBER')">
              <view class="ko-role__item--read--wrap">
                <label class="ko-basic-label">板材定制：</label>
                <UvAvatarGroup
                  :size="avatarGroupSize"
                  gap="0.4"
                  :max-count="8"
                  :urls="getAvatarList('MEMBER', item)"
                  :names="getNameList('MEMBER', item)"
                />
                <button
                  class="ko-basic-button__card added"
                  @click.stop="onCncEnable('MEMBER', item, 'role')"
                >
                  +
                </button>
              </view>
              <button
                class="ko-basic-button__card"
                v-if="getNameList('MEMBER', item).length"
                @click.stop="onCncEnable('MEMBER', item, 'more')"
              >
                更多
              </button>
            </view>

            <block v-else>
              <view class="ko-role__item--read" v-if="item.isMember">
                <view class="ko-role__item--read--wrap">
                  <label class="ko-basic-label">{{ item.memberLabel || "会员" }}：</label>
                  <UvAvatarGroup
                    :size="avatarGroupSize"
                    gap="0.4"
                    :max-count="8"
                    :urls="getAvatarList('MEMBER', item)"
                    :names="getNameList('MEMBER', item)"
                  />
                  <button
                    class="ko-basic-button__card added"
                    @click.stop="onJumpMember('MEMBER', item)"
                  >
                    +
                  </button>
                </view>
                <button
                  class="ko-basic-button__card"
                  v-if="getNameList('MEMBER', item).length"
                  @click.stop="onToAuth('MEMBER', item)"
                >
                  更多
                </button>
              </view>
              <view class="ko-role__item--read" v-if="item.role.includes('STOCK_TAKING')">
                <view class="ko-role__item--read--wrap">
                  <label class="ko-basic-label">盘点：</label>
                  <UvAvatarGroup
                    :size="avatarGroupSize"
                    gap="0.4"
                    :max-count="8"
                    :urls="getAvatarList('TAKING', item)"
                    :names="getNameList('TAKING', item)"
                  />
                  <button
                    class="ko-basic-button__card added"
                    @click.stop="onSetRole('TAKING', item)"
                  >
                    +
                  </button>
                </view>
                <button
                  class="ko-basic-button__card"
                  v-if="getNameList('TAKING', item).length"
                  @click.stop="onToAuth('TAKING', item)"
                >
                  更多
                </button>
              </view>
              <view class="ko-role__item--read">
                <view class="ko-role__item--read--wrap">
                  <label class="ko-basic-label">查看：</label>
                  <UvAvatarGroup
                    :size="avatarGroupSize"
                    gap="0.4"
                    :max-count="8"
                    :urls="getAvatarList('READ', item)"
                    :names="getNameList('READ', item)"
                  />
                  <button
                    class="ko-basic-button__card added"
                    @click.stop="onSetRole('READ', item)"
                  >
                    +
                  </button>
                </view>
                <button
                  class="ko-basic-button__card"
                  @click.stop="onToAuth('READ', item)"
                  v-if="getNameList('READ', item).length"
                >
                  更多
                </button>
              </view>
              <view class="ko-role__item--read">
                <view class="ko-role__item--read--wrap">
                  <label class="ko-basic-label">管理：</label>
                  <UvAvatarGroup
                    :max-count="8"
                    :size="avatarGroupSize"
                    gap="0.4"
                    :urls="getAvatarList('WRITE', item)"
                    :names="getNameList('WRITE', item)"
                  />
                  <button
                    class="ko-basic-button__card added"
                    @click.stop="onSetRole('WRITE', item)"
                  >
                    +
                  </button>
                </view>
                <button
                  class="ko-basic-button__card"
                  @click.stop="onToAuth('WRITE', item)"
                  v-if="getNameList('WRITE', item).length"
                >
                  更多
                </button>
              </view>
            </block>
          </block>

          <view v-else style="display: flex;justify-content: flex-end;align-items: center;">
            <button class="ko-basic-button__card" @click="onJumpCustom('WRITE', item)">定制</button>
          </view>
        </view>
      </view>
    </BasicCard>

    <PickerUser
      ref="PickerUserRef"
      :visible.sync="visible"
      :title="getTitle"

      is-external-open
      type="perm"

      is-confirm
      multiple
      @confirm="onConfirm"
      hide-business
    />

    <KoMovable @click="onTrigger" v-if="(isAdmin || isBusiness) && false">
      <view style="font-size: 12px; line-height: 1.2">
        <block v-if="isCustom">
          <view>取消</view>
          <view>定制</view>
        </block>
        <block v-else>
          <view>定制</view>
          <view>权限</view>
        </block>
      </view>
    </KoMovable>

    <Billing ref="BRef" />
  </view>
</template>

<style lang="scss">
.ko-role {
  padding: 10px 10px 40px;

  $icon-size: 20px;

  &__item {
    position: relative;

    &--center {
      display: flex;
      align-items: center;
      justify-content: center;

      &--icon {
        width: $icon-size;
        height: $icon-size;
        display: flex;
        justify-content: center;
        align-items: center;

        .iconfont {
          font-size: $icon-size;
          display: inline-block;
          height: $icon-size;

          &.icon-kucuntongjifenxi {
            margin-left: calc(100% / 5);
            width: $icon-size;
          }
        }
      }
    }

    &--user {
      margin-top: 0;
    }

    &--read {
      display: flex;
      align-items: center;
      font-size: 13px;
      height: calc(var(--ko-avatar-group-size) + 10px);

      &--wrap {
        flex: 1;
        display: flex;
        align-items: center;
      }

      .ko-basic-button__card {

        &.added {
          width: calc(var(--ko-avatar-group-size) - 10px);
          height: calc(var(--ko-avatar-group-size) - 10px);
          border-radius: 50%;
          margin-left: 12px;
          font-size: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding-top: 4px;
        }

      }
    }
  }

  &__custom {
    position: absolute;
    right: 0;
    top: 0;
    z-index: 99;
  }
}
</style>
