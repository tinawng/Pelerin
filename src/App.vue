<template>
  <portal-eye class="absolute z-50 w-8 top-6 right-6 sm:top-8 sm:right-20 " :open="!!client_id" />
  <div class="page__container" @click="cmdAutoPrompt">
    <input v-model="message" @keydown.enter="sendMessage" ref="cli_input" class="cli_input" type="text" />
    <section class="chat">
      <div v-for="(msg, i) in chat" :key="i" class="my-1.5" :class="msg.key ? 'msg' : 'msg_srv'">
        <span v-if="msg.key" class="mr-2 break-all">&lt;{{nameFormater(msg.key)}}&gt;</span>
        <span class="break-words" v-html="msg.value"></span>
      </div>
    </section>

    <!-- Default text -->
    <div class="my-1.5 msg_srv">
      alternatively, you may learn what this is all <cmd>/about</cmd>, get <cmd>/help</cmd>, or
      <cmd>/visit [channel-name]</cmd>
    </div>
    <p class="my-1.5 msg_srv">type the channel you want to <cmd>/visit</cmd></p>
    <p class="my-1.5 msg_srv">anonymous, no history, instant chat</p>
    <p class="mb-6 sm:mb-12 text-3xl sm:text-7xl">Hello Pilgrim<span class="text-gray-500">*</span></p>
  </div>
</template>

<script setup>
import { ref } from "vue"
import showdown from "showdown"
const converter = new showdown.Converter()
converter.setOption("requireSpaceBeforeHeadingText", true)
converter.setOption("openLinksInNewWindow", true)

const ws = new WebSocket(`wss://${import.meta.env.VITE_API_PREFIX}/ws`)
const client_id = ref("")

const chat = ref([])
const message = ref("")
const message_history = ref([])
const message_history_index = ref(-1)
const cli_input = ref()

ws.onmessage = function (event) {
  const message = JSON.parse(event.data)
  if (message.type === "command") {
    if (message.key === "set-id") {
      client_id.value = message.value
      if (window.location.pathname.length > 1)
        ws.send(JSON.stringify({ type: "command", key: "visit", value: [window.location.pathname.split("/")[1]] }))
    }
    if (message.key === "set-channel") {
      window.history.pushState("", "", message.value)
    }
    if (message.key === "too-many-messages") {
      cli_input.value.classList.add("shake")
      setInterval(() => {
        cli_input.value.classList.remove("shake")
      }, 1000)
    }
  } else if (message.type === "message") {
    message.value = converter.makeHtml(message.value).slice(3, -4)
    chat.value.push(message)
  }
}
ws.onclose = function (e) {
  client_id.value = ""
  chat.value.push({ type: "message", key: undefined, value: "disconnected" })
}
ws.onerror = console.error

document.addEventListener("keydown", (event) => {
  // TODO: is typing event
  if (event.key === "Enter") {
    cli_input.value.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }))
  }
  if (event.key === "ArrowDown") {
    message_history_index.value = Math.max(0, --message_history_index.value)
    message.value = message_history.value[message_history_index.value]
  }
  if (event.key === "ArrowUp") {
    message_history_index.value = Math.min(message_history.value.length, ++message_history_index.value)
    message.value = message_history.value[message_history_index.value]
  }
})

function sendMessage() {
  if (message.value.trim().length == 0) return

  if (message.value.startsWith("/")) {
    let [key, ...value] = message.value.replace("/", "").split(" ")
    ws.send(JSON.stringify({ type: "command", key, value }))
  } else {
    const url_match = new RegExp(
      /^(https?:\/\/)?(?:www\.|(?!www\.))(([a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]|[a-zA-Z0-9]+)\.)+(([a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]|[a-zA-Z0-9]){2,})\/?/i
    )
    message.value = message.value
      .split(" ")
      .map((word) => (url_match.test(word) ? `${word.endsWith(".gif") ? "!" : ""}[${word}](${word})` : word))
      .join(" ")

    ws.send(JSON.stringify({ type: "message", key: client_id.value, value: message.value.trim() }))
  }

  message_history.value.unshift(message.value)
  message_history_index.value = -1
  message.value = ""
}

function nameFormater(id) {
  if (/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/.test(id)) return `Pilgrim-${id.split("-")[0]}`
  else return id
}

function cmdAutoPrompt(event) {
  const el = event.target.closest("cmd")
  if (el) message.value = el.innerText
}
</script>

<style lang="postcss">
#app {
  @apply min-h-screen;
  @apply bg-white;
}
.page__container {
  @apply fixed bottom-0;
  @apply max-h-full w-full;
  @apply mx-auto p-4 sm:p-20;
  @apply flex flex-col-reverse;
  @apply overflow-y-scroll;
}

.chat {
  @apply mb-4 sm:mb-8;
}

.cli_input {
  @apply h-12 w-full;
  @apply p-4;
  @apply bg-gray-100 border rounded-lg;
}
</style>