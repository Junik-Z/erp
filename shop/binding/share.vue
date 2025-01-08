<script>
import { getProductFieldApi, getProductListApi, shareProductApi } from "@/api/erp/product";
import { PageEnums } from "@/utils/config";
import { _isEmpty, _isEqual } from "@/utils";
import InventoryList from "@/shop/components/InventoryList/InventoryList.vue";
import mixins from "@/mixins/mixins";
import PickerClass from "@/components/PickerClass/PickerClass.vue";

export default {
  name: "share",
  components: {PickerClass, InventoryList},
  mixins: [mixins],
  data() {
    return {
      list: [],
      loading: false,
      noMore: false,
      checked: [],

      columnTable: [
        {
          label: "",
          key: "",
          isCheck: true,
          span: 2,
        },
        {
          label: "名称",
          key: "name",
          isField: true,
          span: 12,
        },
        {
          label: "采购",
          key: "purchasePrice",
          isPrice: true,
          span: 5,
        },
        {
          label: "销售",
          key: "salePrice",
          isPrice: true,
          span: 5,
        },
      ],
      FieldList: [],

      queryList: {
        pageSize: 36,
        pageNum: 0,
      },
    };
  },
  onLoad() {
    this.getFieldList();
    this.getList();
  },
  methods: {
    getList(reset = false) {
      if (reset) {
        this.list = [];
        this.queryList.pageNum = 0;
      }

      this.loading = true;
      getProductListApi(this.queryList)
        .then(res => {
          this.list = this.onMergeArrays(this.list, res.data.map(v => ({...v, value: v.id})));
          this.noMore = _isEmpty(res.data) || res.data.length < this.queryList.pageSize;
        })
        .catch(() => {
          this.noMore = true;
        })
        .finally(() => {
          this.loading = false;
        });
    },

    getFieldList() {
      getProductFieldApi({pageSize: 10000, pageNum: 0}).then(res => {
        uni.$__FIELD_LIST__ = res.data;
        this.FieldList = res.data;
      });
    },

    onUnshare() {
      if (this.checked.length === this.list.length) {
        this.checked = [];
      } else {
        this.checked = this.list.map(v => v.id);
      }
    },

    onChecked(item) {
      if (this.checked.includes(item.value)) {
        this.checked = this.checked.filter(id => !_isEqual(item.value, id));
      } else {
        this.checked.push(item.value);
      }
    },

    RequestNextPage() {
      if (this.noMore) return false;
      this.queryList.pageNum += 1;
      this.getList();
    },
  },

  computed: {
    getParams() {
      return {
        title: `推送产品信息给您！`,
        path: PageEnums.shareAddedProduct,
        checked: this.checked,
        query: {
          PAGE_TYPE: "BINDING_PRODUCT",
        },
      };
    },
  },

  // 分享相关
  onShareAppMessage(res) {
    const obj = res.target.dataset.params;

    return new Promise(async (resolve) => {
      try {
        const res = await shareProductApi(obj.checked.map(productId => ({productId})));
        obj.query.PRODUCT_SHARE_ID = res.data;
      } catch (e) {
      }

      const query = await this._GET_SHARE_APP_PARAMS_(obj, "form_scene");

      if (query.title) query.title = `${this.GET_SHOP_NAME || ""} ${query.title}`;

      resolve(query);
    });
  },
};
</script>

<template>
  <view class="ko-share">
    <view class="ko-share__class">
      <PickerClass v-model="queryList.classId" @change="getList(true)" />
    </view>
    <view class="ko-share__wrap">
      <InventoryList
        :list="list"
        :no-more="noMore"
        :no-data="!list.length"
        :columns="columnTable"
        @lower="RequestNextPage"
        :field-list="FieldList"
        @check="onChecked"
        :value="checked"
        :loading="loading"
      />
    </view>

    <view class="ko-share__checked ko-basic-box-shadow">
      <button class="ko-basic-button__card" @click="onUnshare">
        全选
        <text v-if="checked.length" style="font-size: 8px; padding-left: 5px;">已选 {{ checked.length }}</text>
      </button>
      <button
        class="ko-basic-button__card"
        open-type="share"
        :data-params="getParams"
        :disabled="!checked.length"
      >
        分享
      </button>
    </view>
  </view>
</template>

<style scoped lang="scss">
.ko-share {
  height: 100vh;
  display: flex;
  flex-direction: column;

  &__class {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding: 10px 10px 15px;
    // #ifdef H5
    width: 1000px;
    margin: 0 auto;
    // #endif
  }

  &__wrap {
    flex: 1;
    overflow: hidden;
  }

  &__checked {
    display: flex;
    justify-content: space-around;
    align-items: center;
    padding: 10px 30px 30px;
    background: #fff;

    .ko-basic-button__card {
      padding: 10px 15px;
      width: 100px;
    }
  }
}
</style>
