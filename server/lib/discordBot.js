import {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChannelType,
} from "discord.js";
import { getAllTracks } from "./liveProgress.js";
import { cached } from "./cache.js";
import { fetchTop10Demons } from "./pointercrate.js";
import { fetchLiveCreators } from "./liveCreators.js";
import { getGuildConfig, setGuildConfig, clearGuildConfig } from "./discordNotify.js";

const SITE_URL = "https://gdnews.up.railway.app";

const COMMANDS = [
  new SlashCommandBuilder().setName("best").setDescription("Show the best run so far."),
  new SlashCommandBuilder().setName("current").setDescription("Show the most recent attempt."),
  new SlashCommandBuilder().setName("history").setDescription("Show the last few attempts."),
  new SlashCommandBuilder().setName("demonlist").setDescription("Show the current top 10 demonlist."),
  new SlashCommandBuilder().setName("live").setDescription("Show which creators are live right now."),
  new SlashCommandBuilder().setName("site").setDescription("Link to the live stats page."),
  new SlashCommandBuilder()
    .setName("notify-setup")
    .setDescription("Turn on live-run notifications in a channel.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addChannelOption((opt) =>
      opt
        .setName("channel")
        .setDescription("Channel to post updates in")
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true)
    )
    .addStringOption((opt) =>
      opt
        .setName("mode")
        .setDescription("best = only new-best pings, every = every logged run")
        .setRequired(true)
        .addChoices(
          { name: "Best runs only", value: "best" },
          { name: "Every run", value: "every" }
        )
    ),
  new SlashCommandBuilder()
    .setName("notify-off")
    .setDescription("Turn off live-run notifications for this server.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
  new SlashCommandBuilder()
    .setName("notify-status")
    .setDescription("Show the current notification setup for this server.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
].map((c) => c.toJSON());

function formatPercent(attempt) {
  return attempt.display || `${attempt.percent}`;
}

function timeAgo(iso) {
  if (!iso) return "";
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function topTrack() {
  const tracks = getAllTracks();
  return tracks[0] || null;
}

function replyNoTrack(interaction) {
  return interaction.reply({ content: "Nothing is being tracked right now.", ephemeral: true });
}

async function handleBest(interaction) {
  const track = topTrack();
  if (!track) return replyNoTrack(interaction);
  if (!track.best && !track.bestStartpos) {
    return interaction.reply(`**${track.streamer} × ${track.level}** - no attempts logged yet.`);
  }
  const lines = [`**${track.streamer} × ${track.level}**`];
  if (track.best) {
    lines.push(
      `Best: **${formatPercent(track.best)}%**${track.best.note ? ` - ${track.best.note}` : ""}`
    );
  }
  if (track.bestStartpos) {
    lines.push(
      `Best from checkpoint: **${formatPercent(track.bestStartpos)}%**` +
        (track.bestStartpos.note ? ` - ${track.bestStartpos.note}` : "")
    );
  }
  await interaction.reply(lines.join("\n"));
}

async function handleCurrent(interaction) {
  const track = topTrack();
  if (!track) return replyNoTrack(interaction);
  const latest = track.attempts[0];
  if (!latest) {
    return interaction.reply(`**${track.streamer} × ${track.level}** - no attempts logged yet.`);
  }
  await interaction.reply(
    `**${track.streamer} × ${track.level}** - Current: **${formatPercent(latest)}%**` +
      (latest.note ? ` - ${latest.note}` : "") +
      ` (${timeAgo(latest.createdAt)})`
  );
}

async function handleHistory(interaction) {
  const track = topTrack();
  if (!track) return replyNoTrack(interaction);
  if (track.attempts.length === 0) {
    return interaction.reply(`**${track.streamer} × ${track.level}** - no attempts logged yet.`);
  }
  const lines = track.attempts
    .slice(0, 5)
    .map((a) => `**${formatPercent(a)}%**${a.note ? ` - ${a.note}` : ""} (${timeAgo(a.createdAt)})`);
  await interaction.reply(`**${track.streamer} × ${track.level}** - last ${lines.length}:\n${lines.join("\n")}`);
}

async function handleDemonlist(interaction) {
  await interaction.deferReply();
  try {
    const demons = await cached("demonlist:top10", 30 * 60 * 1000, fetchTop10Demons);
    const lines = demons.map(
      (d) => `${d.position}. **${d.name}** by ${d.publisher} - verified by ${d.verifier}`
    );
    await interaction.editReply(lines.join("\n"));
  } catch (err) {
    await interaction.editReply("Couldn't load the demonlist right now.");
    throw err;
  }
}

async function handleLive(interaction) {
  await interaction.deferReply();
  try {
    const { creators } = await cached("live:creators", 2 * 60 * 1000, fetchLiveCreators);
    const live = creators.filter((c) => c.live);
    if (live.length === 0) {
      await interaction.editReply("No pinned creators are live right now.");
      return;
    }
    const lines = live.map((c) => `🔴 **${c.displayName}** is live`);
    await interaction.editReply(lines.join("\n"));
  } catch (err) {
    await interaction.editReply("Couldn't load live status right now.");
    throw err;
  }
}

async function handleSite(interaction) {
  await interaction.reply(`${SITE_URL}/live-stats`);
}

function requireGuild(interaction) {
  if (interaction.guildId) return true;
  interaction.reply({ content: "This only works inside a server.", ephemeral: true });
  return false;
}

async function handleNotifySetup(interaction) {
  if (!requireGuild(interaction)) return;
  const channel = interaction.options.getChannel("channel");
  const mode = interaction.options.getString("mode");
  setGuildConfig(interaction.guildId, channel.id, mode);
  await interaction.reply(
    `Notifications set to **${mode === "every" ? "every run" : "best runs only"}** in <#${channel.id}>. ` +
      "Make sure the bot can send messages there."
  );
}

async function handleNotifyOff(interaction) {
  if (!requireGuild(interaction)) return;
  clearGuildConfig(interaction.guildId);
  await interaction.reply("Notifications turned off for this server.");
}

async function handleNotifyStatus(interaction) {
  if (!requireGuild(interaction)) return;
  const config = getGuildConfig(interaction.guildId);
  if (!config) {
    return interaction.reply({ content: "No notifications configured for this server.", ephemeral: true });
  }
  await interaction.reply({
    content: `Mode: **${config.mode === "every" ? "every run" : "best runs only"}** in <#${config.channelId}>.`,
    ephemeral: true,
  });
}

// Optional: only starts if DISCORD_BOT_TOKEN is set. A missing/invalid
// token, failed command registration, or gateway error must never crash
// the main server - this is an add-on, not a dependency.
export async function startDiscordBot() {
  const token = process.env.DISCORD_BOT_TOKEN;
  if (!token) return;

  const clientId = process.env.DISCORD_CLIENT_ID;
  if (!clientId) {
    console.error("DISCORD_BOT_TOKEN is set but DISCORD_CLIENT_ID is missing - bot not started.");
    return;
  }

  try {
    const rest = new REST({ version: "10" }).setToken(token);
    const guildId = process.env.DISCORD_GUILD_ID;
    if (guildId) {
      // Guild-scoped commands propagate instantly - good for a single-server bot.
      await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: COMMANDS });
      // Global and guild commands are separate sets in Discord - clear any
      // global ones left over from before DISCORD_GUILD_ID was set, or
      // they'll show up as duplicates alongside the guild-scoped ones.
      await rest.put(Routes.applicationCommands(clientId), { body: [] });
    } else {
      // Global commands can take up to an hour to show up everywhere.
      await rest.put(Routes.applicationCommands(clientId), { body: COMMANDS });
    }
  } catch (err) {
    console.error("Failed to register Discord slash commands:", err.message);
    return;
  }

  const client = new Client({ intents: [GatewayIntentBits.Guilds] });

  client.on("interactionCreate", async (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    try {
      if (interaction.commandName === "best") await handleBest(interaction);
      else if (interaction.commandName === "current") await handleCurrent(interaction);
      else if (interaction.commandName === "history") await handleHistory(interaction);
      else if (interaction.commandName === "demonlist") await handleDemonlist(interaction);
      else if (interaction.commandName === "live") await handleLive(interaction);
      else if (interaction.commandName === "site") await handleSite(interaction);
      else if (interaction.commandName === "notify-setup") await handleNotifySetup(interaction);
      else if (interaction.commandName === "notify-off") await handleNotifyOff(interaction);
      else if (interaction.commandName === "notify-status") await handleNotifyStatus(interaction);
    } catch (err) {
      console.error(`Discord command /${interaction.commandName} failed:`, err.message);
      if (!interaction.replied) {
        await interaction
          .reply({ content: "Something went wrong.", ephemeral: true })
          .catch(() => {});
      }
    }
  });

  client.once("ready", () => {
    console.log(`Discord bot logged in as ${client.user.tag}`);
  });

  client.on("error", (err) => {
    console.error("Discord client error:", err.message);
  });

  try {
    await client.login(token);
  } catch (err) {
    console.error("Discord bot failed to log in:", err.message);
  }
}
