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
    if (this.state.tab_completed && this.state.matches.length) {
      if (this.state.match_index) this.state.match_index--;
      else this.state.match_index = this.state.matches.length - 1;
    }
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
    this.state.tab_completed = false;
    super.dispatch(ch, key);
  }
  delete() {
    this.state.tab_completed = false;
    super.delete();
  }
  deleteForward() {
    this.state.tab_completed = false;
    super.deleteForward();
  }
}

const prompt = new FilePrompt({
  message: "Tab Complete a File Path"
});

prompt
  .run()
  .then(answer => console.log("Path:", answer))
  .catch(console.error);
