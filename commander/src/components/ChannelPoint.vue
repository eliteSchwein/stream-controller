no-gutters<script setup lang="ts">
import {sleep} from "@/helper/GeneralHelper";
import { useAppStore } from '@/stores/app';

const appOption = useAppStore();

defineProps({
  channelPoint: {}
})

const loading = ref<boolean | undefined>(false);

function getBackgroundColor(channelPoint: any) {
  if(channelPoint.active) {
    return channelPoint.background;
  }

  return "grey-darken-3"
}

async function toggleChannelPoint(channelPoint: any) {
  if(loading.value) return

  loading.value = true

  const method = channelPoint.active ? "disable" : "enable";

  channelPoint.active = false

  await fetch(`${appOption.getRestApi}/api/channel_points/toggle`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({channel_point: channelPoint, method: method})
  })

  loading.value = false
}

</script>

<template>
  <v-col class="mt-3" cols="4">
    <v-card
      :color="getBackgroundColor(channelPoint)"
      @click.stop="toggleChannelPoint(channelPoint)"
      height="100%"
    >
      <v-card-item style="height: 100%">
        <v-row
          align-content="center"
          justify="center"
          align="center"
        >
          <v-col>
            <v-img
              :src="channelPoint.image"
              cover
              :style="{ 'filter': channelPoint.active === true ? 'none' : 'grayscale(100%)' }"
            >
              <div class="d-flex align-center justify-center fill-height " :style="{ backdropFilter: loading ? 'blur(2px)' : 'none' }" v-if="loading">
                <v-progress-circular
                  color="grey-lighten-4"
                  indeterminate
                ></v-progress-circular>
              </div>
            </v-img>
          </v-col>
          <v-col>
            {{channelPoint.name}}
          </v-col>
          <v-col>
            <v-row
              justify="center"
            >
              <v-switch
                hide-details
                density="compact"
                :model-value="channelPoint.active"
                :indeterminate="loading"
                @click="toggleChannelPoint(channelPoint)"
              ></v-switch>
            </v-row>
          </v-col>
        </v-row>
      </v-card-item>
    </v-card>
  </v-col>
</template>

<style scoped lang="scss">
</style>
