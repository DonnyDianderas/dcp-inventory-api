const bcrypt = require('bcrypt');

module.exports = (mongoose) => {
    // Schema with 8 fields and required password hashing
    const userSchema = mongoose.Schema(
        {
            username: { type: String, required: true, unique: true },
            email: { type: String, required: true, unique: true },
            password: { type: String, required: true },
            firstName: { type: String },
            lastName: { type: String },
            role: { type: String, enum: ['user', 'admin'], default: 'user' },
            lastLogin: { type: Date }, 
            isActive: { type: Boolean, default: true }, 
        },
        { timestamps: true }
    );


    // Pre-save hook to hash the password before saving (security requirement)
userSchema.pre('save', async function() { 
    const user = this;
    if (!user.isModified('password')) {
        return; 
    }
    
    try {
        user.password = await bcrypt.hash(user.password, 10);
        
    } catch (err) {
        throw err; 
    }
});

userSchema.methods.comparePassword = function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
    };

    const User = mongoose.model('User', userSchema);
    return User;
};