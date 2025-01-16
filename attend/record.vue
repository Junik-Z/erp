<script>
import KoList from "@/components/List/List.vue";
import { getAllRecordsListApi } from "@/api/erp/attend";
import mixins from "@/mixins/mixins";
import { CONFIG } from "@/utils/config";
import PickerDate from "./components/PickerDate.vue";
import { _deepCopy, _omit } from "@/utils";
import dayjs from "@/utils/dayjs";


export default {
  name: "record",
  components: {KoList, PickerDate},
  mixins: [mixins],
  data() {
    return {
      loading: false,
      noMore: false,
      list: [],

      queryList: {
        pageSize: CONFIG.DEFAULT_PAGE_SIZE,
        pageNum: 0,
        time: +new Date(),
      },
    };
  },
  onLoad() {
    this.getList(true);
  },
  onReachBottom() {
    this.onRequestNextPage();
  },
  methods: {
    // 请求下一页数据
    onRequestNextPage() {
      if (this.noMore) return false;
      this.queryList.pageNum += 1;
      this.getList();
    },

    getList(reset = false) {
      if (reset) {
        this.queryList.pageNum = 0;
        this.list = [];
        this.tableKey = +new Date();
      }

      const params = _deepCopy(this.queryList);

      const time = dayjs(params.time);

      this.loading = true;

      getAllRecordsListApi({
        ..._omit(params, ["time"]),
        year: time.year(),
        month: time.month() + 1,
      })
        .then(res => {
          console.log(res.data);
        })
        .finally(() => {
          this.loading = false;
        });
    },
  },
  computed: {
    getColumns() {
      return [];
    },
  },
};
</script>

<template>
  <view class="ko-record">
    <view style="padding: 10px;">
      <PickerDate
        mode="year-month"
        :to-format-value="false"
        v-model="queryList.time"
        @change="getList(true)"
        format="YYYY-MM"
      />
    </view>
    <!-- #ifdef MP -->
    <view>
      <KoList :loading="loading" :no-more="noMore" :no-data="!list.length">
        <view style="padding: 5px 10px" v-for="(item, index) of list" :key="item.id">
          <BasicCard>
            <view class="ko-client__info">
              <uni-row gutter="10">
                <uni-col :span="24">
                  <label class="ko-basic-label">计划编号：</label>
                  <text>{{ item.orderCode }}</text>
                </uni-col>
                <uni-col :span="24">
                  <label class="ko-basic-label">预计完成时间：</label>
                  <text>{{ item.planFinishDate }}</text>
                </uni-col>
              </uni-row>
            </view>
          </BasicCard>
        </view>
      </KoList>
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
      />
    </view>
    <!-- #endif -->

  </view>
</template>

<style scoped lang="scss">
.ko-record {

}
</style>
