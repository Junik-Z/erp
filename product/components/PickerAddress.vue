<script>
import { getCustomerAddressListApi, removeCustomerAddressApi } from "@/api/erp/sale";
import { getSupplierAddressListApi, removeSupplierAddressApi } from "@/api/erp/purchase";
import { _isEmpty, CustomToast } from "@/utils";
import KoList from "@/components/List/List.vue";
import BasicCard from "@/components/BasicCard/BasicCard.vue";
import mixins from "@/mixins/mixins";

export default {
  name: "PickerAddress",
  components: {KoList, BasicCard},
  mixins: [mixins],
  props: {
    supplierId: String,
    value: [String, null],
    type: String, // purchase: 供应商；sale: 客户
  },
  data() {
    return {
      loading: false,
      visible: false,
      list: [],
      queryList: {
        pageNum: 0,
      },
      noMore: false,
    };
  },
  methods: {
    // 获取列表
    getList(reset) {
      if (reset) {
        this.queryList.pageNum = 0;
        this.list = [];
      }

      const Fn = {
        sale: getCustomerAddressListApi,
        purchase: getSupplierAddressListApi,
      }[this.type];

      if (Fn) {
        this.loading = true;
        Fn({id: this.supplierId, pageSize: 50, ...this.queryList})
          .then(res => {
            this.list = this.onMergeArrays(this.list, res.data);
            this.noMore = _isEmpty(res.data) || res.data.length < 50;
          })
          .finally(() => {
            this.loading = false;
          });
      }
    },

    // 开启弹窗
    onOpen() {
      this.visible = true;
      this.getList(true);
    },

    // 加载下一页
    onLower() {
      this.queryList.pageNum += 1;
      this.getList();
    },

    // 选中数据了
    onChecked(item) {
      this.$emit("input", item.address);
      this.visible = false;
    },

    // 处理删除
    onRemove(item, index) {
      uni.showModal({
        title: "温馨提示",
        content: "您确定要删除此地址吗？",
        success: (res) => {
          if (res.confirm) {
            const Func = {sale: removeCustomerAddressApi, purchase: removeSupplierAddressApi}[this.type];

            Func({id: item.id})
              .then(() => {
                CustomToast({title: "操作成功", icon: "none"});
                this.list.splice(index, 1);
              });

          }
        },
      });
    },
  },
  computed: {
    // 获取删除按钮的权限
    showRemoveButton() {
      return {
        sale: this.isPerm("CUSTOMER_ADDRESS_DELETE"),
        purchase: this.isPerm("SUPPLIER_ADDRESS_DELETE"),
      }[this.type];
    },
  },
};
</script>

<template>
  <view class="ko-picker-address">
    <button class="ko-basic-button__card" @click="onOpen">
      选择
    </button>

    <BasicPopup :visible.sync="visible" type="bottom" title="选择地址">
      <view class="ko-picker-address__popup">
        <KoList
          :loading="loading"
          :no-more="noMore"
          :no-data="!list.length"
          @lower="onLower"
        >
          <view style="padding: 0 10px;">
            <view
              class="ko-picker-address__popup--item"
              style="padding-top: 5px;"
              v-for="(item, index) of list"
              :key="index"
            >
              <BasicCard :spacing="10" @click="onChecked(item)">
                <view style="font-size: 14px; display: flex; align-items: center;">
                  <view style="flex: 1;">{{ item.address }}</view>

                  <button
                    class="ko-basic-button__card"
                    @click.stop="onRemove(item, index)"
                    v-if="showRemoveButton"
                  >
                    删除
                  </button>
                </view>
              </BasicCard>
            </view>
          </view>
        </KoList>
      </view>
    </BasicPopup>
  </view>
</template>

<style scoped lang="scss">
.ko-picker-address {
  padding-left: 8px;

  // #ifdef MP
  &__popup {
    width: 100vw;
    height: 70vh;
    padding-top: 10px;
    padding-bottom: 10px;
  }

  // #endif

  // #ifdef H5
  &__popup {
    height: 50vh;

    &--item {
      cursor: pointer;
    }
  }

  // #endif
}
</style>
