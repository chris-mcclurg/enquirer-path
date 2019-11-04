const { Input } = require("enquirer");
const path = require("path");
const fs = require("fs");

class FilePrompt extends Input {
  constructor(options = {}) {
    super(options);
    this.state.tab_completed = false;
    this.state.matches = [];
    this.state.match_index = null;
    this.state.working_dir = null;
  }
  next() {
    if (this.state.tab_completed) {
      if (this.state.matches.length) {
        this.state.match_index =
          (this.state.match_index + 1) % this.state.matches.length;
        this.state.input =
          this.state.working_dir + this.state.matches[this.state.match_index];
      } else this.alert();
    } else this.parsePath();
    this.cursor = this.input.length;
    this.clear();
    this.render();
  }
  prev() {
    console.log("Shift Tab");
  }
  parsePath() {
    const parsed = this.state.input.replace(/[\\\/]/g, path.sep);
    const index = parsed.lastIndexOf(path.sep) + 1;
    const dir = parsed.substring(0, index);
    const ext = parsed.substring(index, parsed.length);
    const reg = new RegExp(`^${ext}.*$`, "i");
    try {
      this.state.matches = fs.readdirSync(dir).filter(f => reg.test(f));
      if (this.state.matches.length) {
        this.state.match_index = 0;
        this.state.working_dir = dir;
        this.state.tab_completed = true;
        this.state.input = dir + this.state.matches[0];
      } else {
        this.state.matches = [];
        this.state.match_index = null;
        this.state.tab_completed = false;
        this.alert();
      }
    } catch (err) {
      this.state.matches = [];
      this.state.match_index = null;
      this.state.tab_completed = false;
      this.alert();
    }
  }
  dispatch(ch, key) {
    if (!ch || key.ctrl || key.code) return this.alert();
    this.state.tab_completed = false;
    this.append(ch);
  }
  delete() {
    let { cursor, input } = this.state;
    this.state.tab_completed = false;
    if (cursor <= 0) return this.alert();
    this.input = `${input}`.slice(0, cursor - 1) + `${input}`.slice(cursor);
    this.moveCursor(-1);
    this.render();
  }
  deleteForward() {
    let { cursor, input } = this.state;
    this.state.tab_completed = false;
    if (input[cursor] === void 0) return this.alert();
    this.input = `${input}`.slice(0, cursor) + `${input}`.slice(cursor + 1);
    this.render();
  }
}

// Use the prompt by creating an instance of your custom prompt class.
const prompt = new FilePrompt({
  message: "Tab Complete a File Path"
});

prompt
  .run()
  .then(answer => console.log("Path:", answer))
  .catch(console.error);
