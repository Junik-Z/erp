<script>
import { myBusinessApi } from "@/api/user";
import mixins from "@/mixins/mixins";
import { _get, _isEmpty, _isEqual } from "@/utils";
import KoList from "@/components/List/List.vue";

export default {
  name: "MSwitch",
  components: {KoList},
  mixins: [mixins],
  data() {
    return {
      isShow: false,
      list: [],
      loading: false,
      noMore: false,

      queryList: {
        pageNum: 0,
        pageSize: 20,
      },
      visible: false,

      sRemark: "",
      sName: "",
    };
  },
  mounted() {
    console.log("MSwitch");
    setTimeout(() => {
      this.getList(true);
    }, 600);
  },
  methods: {
    getList(reset) {
      if (reset) {
        this.queryList.pageNum = 0;
        this.list = [];
      }

      const cInfo = this.GET_CONFIG_INFO;
      myBusinessApi(this.queryList)
        .then(res => {
          const data = res.data || [];
          this.isShow = (_isEqual(data.length, 1) && !_isEqual(_get(data, "0.name"), cInfo.name)) || data.length > 1;
          console.log("我的商铺", data, cInfo);

          this.list = this.onMergeArrays(this.list, data);

          this.sRemark = _get(this.list, "0.remark");
          this.sName = _get(this.list, "0.name");

          this.noMore = _isEmpty(data) || data.length < this.queryList.pageSize;
        });
    },

    // 加载下一页
    onLower() {
      if (this.noMore) return false;
      this.queryList.pageNum += 1;
      this.getList();
    },

    // 切换商户
    onSwitch(item) {
      if (_isEqual(this.sName, item.name)) return false;

      this.onLogout(
        {
          scene: item.name,
          PAGE_TYPE: "reselect",
        },
        "",
      )
        .finally(() => {
          this.visible = false;
        });
    },

    // 开启切换
    onOpen() {
      this.visible = true;
    },
  },
};
</script>

<template>
  <view v-if="isShow" class="ko-m-switch">
    <button class="ko-m-switch__btn" @click.stop="onOpen">
      <uv-image
        width="18px"
        height="18px"
        radius="3px"
        :src="getImageUrl(GET_CONFIG_INFO.logo)"
        lazy-load
        :custom-style="{marginRigth: '4px'}"
        v-if="false"
      />

      {{ sRemark }}
    </button>

    <BasicPopup :visible.sync="visible" type="bottom" title="商户">
      <view class="ko-m-switch__popup">
        <KoList
          :data="list"
          :loading="loading"
          :no-more="noMore"
          :no-data="!list.length"
          @lower="onLower"
          @load-next="onLower"
        >
          <view style="padding: 16px;">
            <BasicCard :spacing="10" v-for="item of list" :key="item.id" @click="onSwitch(item)">
              <view style="font-size: 16px; display: flex; align-items: center; padding: 4px 0;">
                <view style="display: flex; align-items: center; flex: 1;">
                  <uv-image
                    width="18px"
                    height="18px"
                    radius="3px"
                    :src="getImageUrl(item.logo)"
                    lazy-load
                    :custom-style="{marginRigth: '4px'}"
                    v-if="item.logo"
                  />
                  {{ item.remark }}
                </view>

                <view>
                  <uv-icon name="arrow-right" size="16px" />
                </view>
              </view>
            </BasicCard>
          </view>
        </KoList>
      </view>
    </BasicPopup>
  </view>
</template>

<style scoped lang="scss">
.ko-m-switch {
  margin-left: 6px;

  &__btn {
    font-size: 14px;
    padding: 2px 10px;
    border-radius: 20px;
    display: flex;
    align-items: center;
  }

  &__popup {
    width: 100vw;
    height: 70vh;
  }
}
</style>
