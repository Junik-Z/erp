<script>
import { MENU_LIST, PageEnums, ROLE_LIST_ENUMS } from "@/utils/config";
import mixins from "@/mixins/mixins";
import UniList from "@/uni_modules/uni-list/components/uni-list/uni-list.vue";
import UniListItem from "@/uni_modules/uni-list/components/uni-list-item/uni-list-item.vue";
import BasicCard from "@/components/BasicCard/BasicCard.vue";
import UvAvatarGroup from "@/uni_modules/uv-avatar/components/uv-avatar-group/uv-avatar-group.vue";
import { getPermissionsApi, setUserRoleApi } from "@/api/admin";
import BasicPopup from "@/components/BasicPopup/BasicPopup.vue";
import UvAvatar from "@/uni_modules/uv-avatar/components/uv-avatar/uv-avatar.vue";
import { _deepCopy, _get, _isEmpty, _isEqual, _xor } from "@/utils";
import PickerUser from "@/components/PickerUser/PickerUser.vue";

export default {
  name: "SetRole",
  components: {PickerUser, UvAvatar, BasicPopup, UvAvatarGroup, BasicCard, UniListItem, UniList},
  mixins: [mixins],
  data() {
    return {
      MenuList: MENU_LIST,
      urls: [],
      visible: false,
      role: "",
      backup: [],

      premList: {},
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
          this.premList = res.data;
        })
        .finally(() => {
          this.loading = false;
        });
    },

    // 开启设置用户权限
    onSetRole(type, item) {
      this.role = (item.role || []).find(v => v.indexOf(type) > -1);
      this.backup = _deepCopy(_get(this.premList, this.role))?.map(v => v.userId) || [];
      this.visible = true;
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
      const users = _xor(this.backup, checked);

      if (_isEmpty(users)) {
        this.visible = false;
        return false;
      }

      const cUsers = users?.map(id => {
        const node = this.$refs.PickerUserRef.getUserInfo(id);
        if (node.role.indexOf(this.role) > -1) {
          node.role = node.role?.filter(v => !_isEqual(v, this.role));
        } else {
          node.role.push(this.role);
        }
        return setUserRoleApi(node);
      });

      Promise.all(cUsers)
        .then(() => {
          uni.showToast({title: "设置成功"});
          this.$refs.PickerUserRef.getList();
          this.getList();
        })
        .finally(() => {
          this.visible = false;
        });
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
        const role = (item.role || []).find(v => v.indexOf(type) > -1);
        return (_get(this.premList, role) || []).map(v => this.getImageUrl(v.avatar));
      };
    },

    getNameList() {
      return (type, item) => {
        const role = (item.role || []).find(v => v.indexOf(type) > -1);
        return (_get(this.premList, role) || []).map(v => v.nickName);
      };
    },

    isBusiness() {
      return (role) => (role || []).includes("Business");
    },
  },
};
</script>

<template>
  <view class="ko-role ko-basic-added-form">
    <UniList>
      <UniListItem v-for="(item, index) of getMenuList" :key="index">
        <template #body>
          <BasicCard>
            <view class="ko-role__item">
              <view class="ko-role__item--header">
                <view class="ko-role__item--header--info">
                  <i class="iconfont" :class="[item.icon]"></i>
                  <view class="ko-basic-label">{{ item.label }}</view>
                </view>
              </view>

              <view class="ko-role__item--user">
                <view class="ko-role__item--read" v-if="item.isMember">
                  <label class="ko-basic-label">{{ item.memberLabel || "会员" }}：</label>
                  <UvAvatarGroup
                    size="52"
                    gap="0.4"
                    :max-count="8"
                    :urls="getAvatarList('Member', item)"
                    :names="getNameList('Member', item)"
                  />
                  <button
                    class="ko-basic-button__card"
                    @click.stop="onJumpMember('Member', item)"
                  >
                    +
                  </button>
                </view>
                <view class="ko-role__item--read" v-if="item.role.includes('Stock_Taking')">
                  <label class="ko-basic-label">盘点：</label>
                  <UvAvatarGroup
                    size="52"
                    gap="0.4"
                    :max-count="8"
                    :urls="getAvatarList('Taking', item)"
                    :names="getNameList('Taking', item)"
                  />
                  <button
                    class="ko-basic-button__card"
                    @click.stop="onSetRole('Taking', item)"
                  >
                    +
                  </button>
                </view>
                <view class="ko-role__item--read">
                  <label class="ko-basic-label">查看：</label>
                  <UvAvatarGroup
                    size="52"
                    gap="0.4"
                    :max-count="8"
                    :urls="getAvatarList('Read', item)"
                    :names="getNameList('Read', item)"
                  />
                  <button
                    class="ko-basic-button__card"
                    @click.stop="onSetRole('Read', item)"
                  >
                    +
                  </button>
                </view>
                <view class="ko-role__item--read">
                  <label class="ko-basic-label">管理：</label>
                  <UvAvatarGroup
                    :max-count="8"
                    size="52"
                    gap="0.4"
                    :urls="getAvatarList('Write', item)"
                    :names="getNameList('Write', item)"
                  />
                  <button
                    class="ko-basic-button__card"
                    @click.stop="onSetRole('Write', item)"
                  >
                    +
                  </button>
                </view>
              </view>
            </view>
          </BasicCard>
        </template>
      </UniListItem>
    </UniList>

    <PickerUser
      ref="PickerUserRef"
      :visible.sync="visible"
      :title="getTitle"
      :value="backup"
      is-confirm
      multiple
      @confirm="onConfirm"
      hide-business
    />
  </view>
</template>

<style scoped lang="scss">
.ko-role {
  padding-bottom: 40px;

  &__item {
    /* #ifdef MP */
    &--header {
      display: flex;
      align-items: center;
      justify-content: center;

      .ko-basic-label {
        text-align: center;
      }

      .iconfont {
        font-size: 60px;

        &.icon-kucuntongjifenxi {
          margin-left: 30px;
          width: 60px;
        }
      }
    }

    /* #endif */

    /* #ifdef H5 */
    &--header {
      display: flex;
      align-items: center;
      justify-content: center;

      &--info {
        height: 100%;
      }

      .ko-basic-label {
        text-align: center;

      }

      .iconfont {
        font-size: 60px;
        display: inline-block;
        height: 60px;

        &.icon-kucuntongjifenxi {
          margin-left: 30px;
          width: 60px;
        }
      }
    }

    /* #endif */


    &--user {
      margin-top: 20px;
    }

    &--read {
      display: flex;
      align-items: center;
      height: 64px;

      .ko-basic-button__card {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        margin-left: 20px;
        font-size: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        padding-top: 4px;
      }
    }
  }
}
</style>
