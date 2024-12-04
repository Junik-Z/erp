<script>
import { MENU_LIST, ROLE_LIST_ENUMS } from "@/utils/config";
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

      console.log(this.backup);

      this.visible = true;
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

    isBusiness() {
      return (role) => (role || []).includes("Business");
    },
  },
};
</script>

<template>
  <view class="ko-role">
    <UniList>
      <UniListItem v-for="(item, index) of getMenuList" :key="index">
        <template #body>
          <BasicCard>
            <view class="ko-role__item">
              <view class="ko-role__item--header">
                <view>
                  <i class="iconfont" :class="[item.icon]"></i>
                  <view class="ko-basic-label">{{ item.label }}</view>
                </view>
              </view>

              <view class="ko-role__item--user">
                <view class="ko-role__item--read">
                  <label class="ko-basic-label">查看：</label>
                  <UvAvatarGroup
                    size="40"
                    gap="0.4"
                    :max-count="8"
                    :urls="getAvatarList('Read', item)"
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
                    size="40"
                    gap="0.4"
                    :urls="getAvatarList('Write', item)"
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
      @confirm="onConfirm"
      hide-business
    />
  </view>
</template>

<style scoped lang="scss">
.ko-role {
  padding-bottom: 40px;

  &__item {
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

    &--user {
      margin-top: 20px;
    }

    &--read {
      display: flex;
      align-items: center;
      height: 50px;

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

  &__popup {
    width: 98vw;

    &--list {
      height: 67vh;
      overflow-y: auto;
    }

    &--info {
      display: flex;
      align-items: center;
      position: relative;

      .icon-shanghuguanli {
        position: absolute;
        top: -10px;
        right: -6px;
        color: #f3a73f;
        font-size: 18px;
      }

      &:before {
        content: " ";
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 2;
      }
    }
  }
}
</style>
