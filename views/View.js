class View {
  pushMessage(ctx, message) {
    ctx.channel.send(message);
  }
}

module.exports = View;
