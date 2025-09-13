curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- --default-toolchain nightly -y
rustup target add thumbv7m-none-eabi
. "$HOME/.cargo/env" 
