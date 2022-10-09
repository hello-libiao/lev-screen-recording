<template>
    <div class="page-wrapper startup-page">
        <!-- <p>启动页</p> -->
        <h1 data-text="Loading...">Loading...</h1>
    </div>
</template>
<script setup>

</script>
<style lang="less" scoped>
.startup-page{
  background: yellowgreen;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #000;
  h1{
    position: relative;
    font-size: 3em;
    color: #222;
    text-transform: uppercase;
    border-bottom: 16px solid #222;
    letter-spacing: 0.05em;
    line-height: 1.2em;
  }
  h1:before{
    content: attr(data-text);
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    color: #03a9f4;
    overflow: hidden;
    border-bottom: 16px solid #03a9f4;
    animation: animate 3s linear infinite;
  }
  @keyframes animate {
    0%{
      width: 0;
    }
    100%{
      width: 100%;
    }
  }
}
</style>
