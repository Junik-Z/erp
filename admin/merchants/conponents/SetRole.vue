<script>
import { MENU_LIST, ROLE_LIST_ENUMS } from "@/utils/config";
import mixins from "@/mixins/mixins";
import UniList from "@/uni_modules/uni-list/components/uni-list/uni-list.vue";
import UniListItem from "@/uni_modules/uni-list/components/uni-list-item/uni-list-item.vue";
import BasicCard from "@/components/BasicCard/BasicCard.vue";
import UvAvatarGroup from "@/uni_modules/uv-avatar/components/uv-avatar-group/uv-avatar-group.vue";
import { getUserListApi, setUserRoleApi } from "@/api/admin";
import BasicPopup from "@/components/BasicPopup/BasicPopup.vue";
import UvAvatar from "@/uni_modules/uv-avatar/components/uv-avatar/uv-avatar.vue";
import { _deepCopy, _isEqual } from "@/utils";

export default {
  name: "SetRole",
  components: {UvAvatar, BasicPopup, UvAvatarGroup, BasicCard, UniListItem, UniList},
  mixins: [mixins],
  data() {
    return {
      MenuList: MENU_LIST,
      urls: [],
      visible: false,
      role: "",

      userList: [],
      backup: [],
    };
  },
  methods: {
    getList() {
      this.loading = true;
      getUserListApi()
        .then(res => {
          this.userList = res.data;
          console.log(res.data);
        })
        .finally(() => {
          this.loading = false;
        });
    },

    // 开启设置用户权限
    onSetRole(type, item) {
      this.role = (item.role || []).find(v => v.indexOf(type) > -1);
      this.backup = _deepCopy(this.userList);
      this.visible = true;
    },

    // 选中用户
    onSelect(node) {
      this.visible = false;
      let ro = _deepCopy(node.role || []);

      if (this.isSameRole(ro, this.role)) {
        if (ro.indexOf(this.role) > -1) {
          ro = ro.filter(v => v !== this.role);
          this.$set(node, "role", ro);
        }
        console.log("超管");
      } else {
        ro.push(this.role);
        this.$set(node, "role", ro);
      }

      if (!_isEqual(node.role, ro)) {
        setUserRoleApi(node)
          .then(() => {
            uni.showToast({title: "设置成功"});
            this.getList();
          });
      }
    },
  },
  computed: {
    getMenuList() {
      return this.MenuList.filter(item => {
        return !["/admin/merchants/merchants", "/admin/admin/index", '/admin/user/user'].includes(item.value);
      });
    },

    getTitle() {
      return (ROLE_LIST_ENUMS[this.role] || "") + "权限设置";
    },

    getAvatarList() {
      return (type, item) => {
        const role = (item.role || []).find(v => v.indexOf(type) > -1);
        return (this.userList || []).filter(child => this.isSameRole(child.role, role));
      };
    },

    isSameRole() {
      return (roles, role) => {
        return roles.indexOf(role) > -1 || roles.indexOf("Business") > -1;
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

    <BasicPopup :visible.sync="visible" :title="getTitle">
      <view class="ko-role__popup">
        <view class="ko-role__popup--list">
          <UniList>
            <UniListItem v-for="(item, index) of backup" :key="index">
              <template #body>
                <BasicCard>
                  <view class="ko-role__popup--info" @click="onSelect(item)">
                    <view style="margin-right: 10px;">
                      <checkbox :checked="isSameRole(item.role, role)" />
                    </view>
                    <UvAvatar :size="64" :src="getImageUrl(item.avatar)" />
                    <text style="margin-left: 10px;">{{ item.nickName || "-" }}</text>

                    <i v-if="isBusiness(item.role)" class="iconfont icon-shanghuguanli"></i>
                  </view>
                </BasicCard>
              </template>
            </UniListItem>
          </UniList>
        </view>
      </view>

      <template #footer v-if="false">
        <button style="margin: 10px 40px 10px;" class="ko-basic-button">确认</button>
      </template>
    </BasicPopup>
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
