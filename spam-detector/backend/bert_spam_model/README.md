# Local BERT inference bundle

Place the trusted, fine-tuned spam classifier and its matching tokenizer in this directory. The reviewed archive contained `config.json`, `model.safetensors`, `tokenizer.json`, `tokenizer_config.json`, and `vocab.pkl`. The pickle is not read by the API; do not load arbitrary pickles.

For a fresh export, use the Transformers `save_pretrained()` method on both the fine-tuned model and its tokenizer, targeting this directory. Keep the tokenizer files produced by that export together with `config.json` and the weights. The API assumes output class 0 means ham and class 1 means spam; verify this mapping before using a replacement model.

The original weights are approximately 418 MiB and are deliberately excluded from regular Git. Keep a local copy or distribute a versioned bundle through a model host, Git LFS, or a release after verifying redistribution rights. No public download link was supplied with the project.

The API loads this bundle at startup and cannot start without it. An unmodified general-purpose BERT checkpoint is not a substitute for the fine-tuned classifier.
