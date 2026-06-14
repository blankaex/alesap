<h1 align="center">🍯🍞 alesap</h1>

<p align="center"> <i>Browser controller for a certain carb-heavy karaoke
system,<br> powered by <a
href="https://github.com/davidsiaw/alesap-server">alesap-server</a>.</i> </p>

<p align="center"> <a
href="https://alesap.blankaex.reisen">alesap.blankaex.reisen</a> </p>

---

**alesap** is a browser application that turns your phone into a karaoke remote
control, designed by people who actually use the system. Scan a room QR code,
find the song you want, and fire it straight to the machine. Lightweight,
mobile-first, and works on any device.

## ✨ Features

### 🔎 Search that actually finds the song
- **Smart, forgiving matching.** Powered by `alesap-server`'s Japanese-aware
  search engine. Mix and match kanji, hiragana, katakana, romaji, English, and
  partial fragments.
- **Blazing-fast incremental results.** Pages stream in as soon as the server
  finds them, so first matches appear in milliseconds.
- **Powerful query operators.** Filter inline with advanced flags, like
  `artist:yoasobi`, `genre:アニメ`, and more.
- **Auto-pagination.** Keep scrolling and more results keep loading.

### 📚 Rich song information at a glance
- **Title, artist, and song code.** The basics, surfaced on every result.
- **Genre and content type tags.** PV version, original/cover, and more.
- **Tie-up and program name.** Anime, drama, and movie associations included.
- **Intro lyrics snippet.** Double-check you've got the right version.
- **Full raw metadata.** Available in developer mode.

### ❤️ Favourites
- **One-tap favouriting.** Star songs straight from the song menu.
- **Auto-sorted list.** Organised by artist then title.
- **Local-first storage.** Your taste in music never leaves your device.

### 🕘 History
- **Automatic tracking.** Every queued song is saved with a timestamp.
- **Searchable timeline.** See what you played today, last week, or last month.
- **Most-played stats.** Track your top songs over time in the built-in stats
  view.

### 📦 Import / Export
- **Cross-device sync.** Share history/favourites between devices and friends.
- **Anonymous nickname keyed.** No accounts or passwords required.

### 🎲 "I'm Feeling Lucky"
- **Random from history.** Queue something you've sung before.
- **Random from favourites.** Queue something you know you love.

### 📱 Built for the karaoke room
- **QR code session pairing.** Auto-detects rear cameras with manual override.
- **Mobile-first dark UI.** Easy on the eyes in a dark karaoke room.
- **Intuitive back-button navigation.** Intelligently controls the application
  and steps back through your search history.
- **Toast notifications.** Instant feedback for every important event.

### 🛑 Full playback control
- **Queue songs.** Send instantly to the active room.
- **Stop the current song.** One tap to move on.

### 🛠️ Developer mode
- **Live debug widget.** See session state, local storage, and device info in
  real time.
- **Raw API payloads.** Inspect exactly what the server returned for any song.

### 🙈 Privacy-first
- **No accounts, no tracking, no mandatory backend persistence.**
- **Local-first storage.** Favourites, history, nicknames, and stats live in
  your browser by default. Import/export is opt-in and keyed only by your
  anonymous nickname — no personal data is ever required.
- **Auto-generated nicknames.** Never think one up again, unless you want to.

## 🧠 Powered by

- [`alesap-server`](https://github.com/davidsiaw/alesap-server) — the
  Rails-based search and control API that makes all of the above possible.
- [Weaver](https://github.com/davidsiaw/weaver) for the page scaffolding.
- A questionable amount of jQuery, Bootstrap, html5-qrcode, and Toastify.
