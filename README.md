# YouTube Downloader

An app to download YouTube videos into various audio and video formats.

# Supported Platforms

Currently, just macOS, but other platforms are in the works! Just need to figure
out this build pipeline for Windows and Linux.

The Mac version isn't signed (yet), so if you want to run it, you'll either need
to build it yourself, or trust the unidentified developer.

You can find the releases [here](https://github.com/ksmithut/youtube-download/releases).

# Details

This is really just a wrapper around the [`youtube-dl`](https://rg3.github.io/youtube-dl/)
utility with a very minimalistic use case: Download as an Audio File or Video
File. `youtube-dl` has tons of different options, and I suppose over time I'll
adjust this app to get the best results, but for now, I just needed to use this
to be able to take my Karaoke offline.

Because it uses `youtube-dl` (and `ffmpeg`), building for other platforms is
more complicated, but not impossible. Since I'm doing most of my work on a mac,
I decided to build it there first, then build it for the other platforms as a
learning experience further down the line.
