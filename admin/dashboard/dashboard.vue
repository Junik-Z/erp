<!-- #ifdef H5 -->
<script>
import Wrapper from "./components/Wrapper.vue";
import mixins from "@/mixins/mixins";
import UniRow from "@/uni_modules/uni-row/components/uni-row/uni-row.vue";
import UniCol from "@/uni_modules/uni-row/components/uni-col/uni-col.vue";
import UvCountTo from "@/uni_modules/uv-count-to/components/uv-count-to/uv-count-to.vue";
import QiunDataCharts from "@/uni_modules/qiun-data-charts/components/qiun-data-charts/qiun-data-charts.vue";

export default {
  name: "dashboard",
  mixins: [mixins],
  data() {
    return {};
  },
  components: {QiunDataCharts, UvCountTo, UniCol, UniRow, Wrapper},
  methods: {},
};
</script>

<template>
  <div class="ko-dashboard ko-basic-page-background">
    <header class="ko-dashboard__header">
      {{ GET_SHOP_NAME }}
    </header>

    <div class="ko-dashboard__body">
      <UniRow :gutter="20">
        <UniCol :span="16">
          <div class="ko-finance">
            <UniRow :gutter="20">
              <UniCol :span="6">
                <Wrapper>
                  <div class="ko-wrapper-center">
                    <header>应收总额</header>
                    <div class="ko-wrapper-center__number">
                      <UvCountTo color="rgba(14, 253, 255, 1)" :start-val="0" :end-val="500" separator="," />
                    </div>
                  </div>
                </Wrapper>
              </UniCol>
              <UniCol :span="6">
                <Wrapper>
                  <div class="ko-wrapper-center">
                    <header>已收账款</header>
                    <div class="ko-wrapper-center__number">
                      <UvCountTo color="rgba(14, 253, 255, 1)" :start-val="0" :end-val="500" separator="," />
                    </div>
                  </div>
                </Wrapper>
              </UniCol>
              <UniCol :span="6">
                <Wrapper>
                  <div class="ko-wrapper-center">
                    <header>对账订单</header>
                    <div class="ko-wrapper-center__number">
                      <UvCountTo color="rgba(14, 253, 255, 1)" :start-val="0" :end-val="500" separator="," />
                    </div>
                  </div>
                </Wrapper>
              </UniCol>
              <UniCol :span="6">
                <Wrapper>
                  <div class="ko-wrapper-center">
                    <header>对账客户数量</header>
                    <div class="ko-wrapper-center__number">
                      <UvCountTo color="rgba(14, 253, 255, 1)" :start-val="0" :end-val="500" separator="," />
                    </div>
                  </div>
                </Wrapper>
              </UniCol>
              <UniCol :span="6">
                <Wrapper>
                  <div class="ko-wrapper-center">
                    <header>应付总额</header>
                    <div class="ko-wrapper-center__number">
                      <UvCountTo color="rgba(14, 253, 255, 1)" :start-val="0" :end-val="500" separator="," />
                    </div>
                  </div>
                </Wrapper>
              </UniCol>
              <UniCol :span="6">
                <Wrapper>
                  <div class="ko-wrapper-center">
                    <header>生产订单数</header>
                    <div class="ko-wrapper-center__number">
                      <UvCountTo color="rgba(14, 253, 255, 1)" :start-val="0" :end-val="500" separator="," />
                    </div>
                  </div>
                </Wrapper>
              </UniCol>
              <UniCol :span="6">
                <Wrapper>
                  <div class="ko-wrapper-center">
                    <header>已付总额</header>
                    <div class="ko-wrapper-center__number">
                      <UvCountTo color="rgba(14, 253, 255, 1)" :start-val="0" :end-val="500" separator="," />
                    </div>
                  </div>
                </Wrapper>
              </UniCol>
              <UniCol :span="6">
                <Wrapper>
                  <div class="ko-wrapper-center">
                    <header>库存总量</header>
                    <div class="ko-wrapper-center__number">
                      <UvCountTo color="rgba(14, 253, 255, 1)" :start-val="0" :end-val="500" separator="," />
                    </div>
                  </div>
                </Wrapper>
              </UniCol>
              <UniCol :span="6">
                <Wrapper>
                  <div class="ko-wrapper-center">
                    <header>库存总价值</header>
                    <div class="ko-wrapper-center__number">
                      <UvCountTo color="rgba(14, 253, 255, 1)" :start-val="0" :end-val="500" separator="," />
                    </div>
                  </div>
                </Wrapper>
              </UniCol>
              <UniCol :span="6">
                <Wrapper>
                  <div class="ko-wrapper-center">
                    <header>员工工资</header>
                    <div class="ko-wrapper-center__number">
                      <UvCountTo color="rgba(14, 253, 255, 1)" :start-val="0" :end-val="500" separator="," />
                    </div>
                  </div>
                </Wrapper>
              </UniCol>
              <UniCol :span="6">
                <Wrapper>
                  <div class="ko-wrapper-center">
                    <header>其它费用</header>
                    <div class="ko-wrapper-center__number">
                      <UvCountTo color="rgba(14, 253, 255, 1)" :start-val="0" :end-val="500" separator="," />
                    </div>
                  </div>
                </Wrapper>
              </UniCol>
              <UniCol :span="6">
                <Wrapper>
                  <div class="ko-wrapper-center">
                    <header>库存预警</header>
                    <div class="ko-wrapper-center__number">
                      <UvCountTo color="rgba(14, 253, 255, 1)" :start-val="0" :end-val="500" separator="," />
                    </div>
                  </div>
                </Wrapper>
              </UniCol>
            </UniRow>
          </div>
        </UniCol>
        <UniCol :span="8">
          <Wrapper>
            <div class="ko-wrapper-center" style="height: 270px;">
              <header>库存预警</header>
              <div class="ko-wrapper-center__center">
                <QiunDataCharts
                  type="column"
                  :opts="getBasicChartsOptions({})"
                />
              </div>
            </div>
          </Wrapper>
        </UniCol>
        <UniCol :span="8">
          <Wrapper>
            <div class="ko-wrapper-center">
              <header>订单列表</header>
              <div class="ko-wrapper-center__center ko-order__wrap">
                <UniRow>
                  <UniCol :span="24">
                    <div class="ko-order ko-order__header">
                      <label>订单编号</label>
                      <label>金额</label>
                    </div>
                  </UniCol>
                  <UniCol :span="24">
                    <div class="ko-order">
                      <label>D133444</label>
                      <label>300</label>
                    </div>
                  </UniCol>
                  <UniCol :span="24">
                    <div class="ko-order">
                      <label>D133444</label>
                      <label>300</label>
                    </div>
                  </UniCol>
                  <UniCol :span="24">
                    <div class="ko-order">
                      <label>D133444</label>
                      <label>300</label>
                    </div>
                  </UniCol>
                </UniRow>
              </div>
            </div>
          </Wrapper>
        </UniCol>
      </UniRow>
    </div>
  </div>
</template>

<style scoped lang="scss">

.ko-dashboard {
  height: 100vh;

  &__header {
    background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAB4AAAABsCAYAAACLg6+xAAAACXBIWXMAAAsTAAALEwEAmpwYAAAFFmlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDAgNzkuMTYwNDUxLCAyMDE3LzA1LzA2LTAxOjA4OjIxICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ0MgKE1hY2ludG9zaCkiIHhtcDpDcmVhdGVEYXRlPSIyMDE5LTA2LTE5VDE5OjEwOjA3KzA4OjAwIiB4bXA6TW9kaWZ5RGF0ZT0iMjAxOS0wNi0xOVQxOToxMTo1NCswODowMCIgeG1wOk1ldGFkYXRhRGF0ZT0iMjAxOS0wNi0xOVQxOToxMTo1NCswODowMCIgZGM6Zm9ybWF0PSJpbWFnZS9wbmciIHBob3Rvc2hvcDpDb2xvck1vZGU9IjMiIHBob3Rvc2hvcDpJQ0NQcm9maWxlPSJzUkdCIElFQzYxOTY2LTIuMSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDplMDJjZWY4Yi0zNzc2LTQ1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") no-repeat;
    background-size: 100% 100%;

    height: 60px;
    text-align: center;
    line-height: 60px;
    font-size: px2rem(30);
  }

  &__body {
    padding: px2rem(20);
  }
}

.ko-wrapper-center {
  header {
    font-size: px2rem(14);
  }

  &__number {
    margin-top: 10px;
    display: flex;
    align-items: center;
  }

  &__center {

  }
}

.ko-finance {
}

.ko-order {
  display: flex;
  align-items: center;
  margin: 4px 0;

  label {
    flex: 1;
  }

  &__wrap {
    margin-top: px2rem(10);
  }

  &__header {
    font-size: px2rem(16);
    font-weight: bold;
  }
}

</style>
<!-- #endif -->
